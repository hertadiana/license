import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onFileParsed: (plate: string, date: string) => void;
}

export default function Uploader({ onFileParsed }: Props) {
  const onDrop = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];

    // Extract plate from filename (e.g., "B123XYZ.jpg" -> "B 123 XYZ")
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    const formattedPlate = nameWithoutExtension
      .replace(/(\D{1,2})(\d{2,3})(\D{1,2})/, "$1 $2 $3")
      .toUpperCase();

    // Extract file date (fallback to current date)
    const fileDate = file.lastModified
      ? new Date(file.lastModified).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    onFileParsed(formattedPlate, fileDate);
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
