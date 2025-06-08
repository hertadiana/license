import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './Uploader.css'; // Or whatever your CSS filename is

interface Props {
  onFileParsed: (plate: string, date: string) => void;
}

export default function Uploader({ onFileParsed }: Props) {
  
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (file) {
    console.log('File last modified:', file.lastModified || new Date(file.lastModified));
  }
}

  const onDrop = useCallback((files: File[]) => {
    if (files.length === 0) return;

  const file = files[0];

  const formData = new FormData();
  formData.append("image", file);

  // Append the file's last modified date as ISO string
  formData.append("fileLastModified", new Date(file.lastModified).toISOString());

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

  // ... inside your Uploader component's return statement ...

return (
  <div {...getRootProps()} className={`drop-box ${isDragActive ? 'active' : ''}`}>
    <input {...getInputProps()} />
   
    {isDragActive ? <img
      src="/apple-camera.png" // ✅ Corrected path if image is in public folder
      alt="Camera Icon for Upload"
      className="upload-icon"
    /> :  <img
      src="/upload.png" // ✅ Corrected path if image is in public folder
      alt="Camera Icon for Upload"
      className="upload-icon"
    />}
  </div>
);
}