import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onFileParsed: (plate: string, date: string) => void;
}

export default function Uploader({ onFileParsed }: Props) {
  const onDrop = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];

    const formData = new FormData();
    formData.append("image", file);

    fetch("http://localhost:5000/predict", {
      method: "POST",
      body: formData
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Prediction failed");
        }
        return res.json();
      })
      .then(data => {
        onFileParsed(data.plate, data.date);
      })
      .catch(err => {
        alert(`Error: ${err.message}`);
        console.error(err);
      });

  }, [onFileParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  return (
    <div {...getRootProps()} className={`drop-box ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      {isDragActive ? 'Drop image' : 'Drag & drop plate photo'}
    </div>
  );
}
