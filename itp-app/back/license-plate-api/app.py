from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import yolov5
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from datetime import datetime
from ultralytics import YOLO

model_yolo = YOLO('models/license_plate_detector.pt')

# Init Flask
app = Flask(__name__)
CORS(app)

# Load YOLOv5 model (local best.pt)
# model_yolo = torch.hub.load('yolov5', 'custom', path='models/license_plate_detector.pt', source='local')
model_yolo.conf = 0.25
model_yolo.iou = 0.45
model_yolo.agnostic = False
model_yolo.multi_label = False
model_yolo.max_det = 1000

# Load TrOCR model
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
model_ocr = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")

# Format for Romanian license plates
def format_romanian_plate(raw: str) -> str:
    raw = ''.join(filter(str.isalnum, raw.upper()))
    if len(raw) < 6:
        return raw
    if raw.startswith('B') and raw[1:4].isdigit() and raw[4:].isalpha():
        return f"{raw[0]} {raw[1:4]} {raw[4:]}"
    if raw[:2].isalpha() and raw[2:4].isdigit() and raw[4:].isalpha():
        return f"{raw[:2]} {raw[2:4]} {raw[4:]}"
    return raw

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    try:
        file = request.files['image']
        im = Image.open(file.stream).convert('RGB')

        # YOLOv8 detection
        results = model_yolo.predict(source=im, imgsz=640)
        predictions = results[0].boxes.data  # tensor: [x1, y1, x2, y2, conf, class]

        if predictions is None or len(predictions) == 0:
            return jsonify({'error': 'No license plate detected'}), 404

        # Get best box (highest confidence)
        boxes = predictions[:, :4]
        scores = predictions[:, 4]
        best_idx = scores.argmax()
        best_box = boxes[best_idx].tolist()
        xmin, ymin, xmax, ymax = map(int, best_box)
        crop = im.crop((xmin, ymin, xmax, ymax))

        # OCR with TrOCR
        image = crop.convert("RGB")
        pixel_values = processor(image, return_tensors="pt").pixel_values
        generated_ids = model_ocr.generate(pixel_values)
        generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

        formatted = format_romanian_plate(generated_text.strip())

        return jsonify({
            'plate': formatted,
            'date': datetime.today().strftime('%Y-%m-%d')
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
