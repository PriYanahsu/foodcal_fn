import React, { useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';

interface CameraInputProps {
  onImageSelect: (file: File) => void;
  isLoading?: boolean;
}

export const CameraInput: React.FC<CameraInputProps> = ({
  onImageSelect,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
      <Button
        onClick={handleClick}
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full"
        variant="primary"
        size="lg"
      >
        {isLoading ? 'Processing...' : 'Upload Food Image'}
      </Button>
    </div>
  );
};
