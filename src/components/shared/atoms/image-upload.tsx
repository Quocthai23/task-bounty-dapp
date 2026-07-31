import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 shrink-0 rounded-full bg-neutral-100 border-2 border-neutral-200 overflow-hidden flex items-center justify-center">
        {value ? (
          <img src={value} alt="Avatar Preview" className="w-full h-full object-cover" />
        ) : (
          <UploadCloud className="text-neutral-300" size={24} />
        )}
      </div>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <p className="text-sm font-semibold text-primary-600">Click to upload or drag and drop</p>
        <p className="text-xs text-neutral-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
      </div>
    </div>
  );
};
