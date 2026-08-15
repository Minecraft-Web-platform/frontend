import React, { useState, useRef } from 'react';
import { uploadService } from '../../services/upload.service';
import './ImageUploader.scss';
import { ImageCropperModal } from './ImageCropperModal';

interface ImageUploaderProps {
  folder?: string;
  multiple?: boolean;
  value?: string | string[];
  onChange: (urls: string | string[]) => void;
  label?: string;
  maxFiles?: number;
  customUploadFn?: (file: File) => Promise<string>;
  enableCrop?: boolean;
  aspect?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  folder = 'misc',
  multiple = false,
  value,
  onChange,
  label = 'Загрузить картинку',
  maxFiles = 5,
  customUploadFn,
  enableCrop = false,
  aspect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);

  const urls: string[] = value ? (Array.isArray(value) ? value : [value]) : [];

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    setError(null);
    if (!multiple && files.length > 1) {
      files = [files[0]];
    }
    
    if (multiple && urls.length + files.length > maxFiles) {
      setError(`Максимальное количество файлов: ${maxFiles}`);
      return;
    }
    if (enableCrop && !multiple && files.length === 1) {
      setFileToCrop(files[0]);
      return;
    }

    await performUpload(files);
  };

  const performUpload = async (files: File[]) => {
    setIsUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error('Пожалуйста, загружайте только изображения (JPG, PNG, WEBP)');
        }
        
        let url;
        if (customUploadFn) {
          url = await customUploadFn(file);
        } else {
          url = await uploadService.uploadImage(file, folder);
        }
        newUrls.push(url);
      }

      if (multiple) {
        onChange([...urls, ...newUrls]);
      } else {
        onChange(newUrls[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropSave = async (croppedFile: File) => {
    setFileToCrop(null);
    await performUpload([croppedFile]);
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple) {
      onChange(urls.filter(url => url !== urlToRemove));
    } else {
      onChange('');
    }
  };

  return (
    <div className="image-uploader">
      {label && <label className="uploader-label">{label}</label>}
      
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          multiple={multiple} 
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
        />
        
        {isUploading ? (
          <div className="upload-state">
            <div className="spinner"></div>
            <span>Загрузка...</span>
          </div>
        ) : (
          <div className="idle-state">
            <span className="icon">📸</span>
            <span className="text">Перетащите картинку сюда или <strong>нажмите для выбора</strong></span>
          </div>
        )}
      </div>

      {error && <div className="uploader-error">{error}</div>}

      {urls.length > 0 && (
        <div className="previews">
          {urls.map((url, i) => (
            <div key={i} className="preview-item">
              <img src={url} alt={`Preview ${i}`} />
              <button 
                type="button" 
                className="remove-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(url);
                }}
                title="Удалить"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {fileToCrop && (
        <ImageCropperModal
          imageFile={fileToCrop}
          aspect={aspect}
          onClose={() => setFileToCrop(null)}
          onCropSave={handleCropSave}
        />
      )}
    </div>
  );
};
