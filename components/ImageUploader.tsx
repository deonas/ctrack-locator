'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string, detectedLocation: string) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Prepare form data
      const formData = new FormData();
      formData.append('image', file);

      // Call API endpoint
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Image processing failed');
      }

      const result = await response.json();
      
      if (!result.detectedLocation) {
        throw new Error('Could not determine location from image');
      }

      // Pass results to parent
      onImageUpload(previewUrl, result.detectedLocation);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to process image',
        variant: "destructive",
      });
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [onImageUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Analyzing image...</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8" />
              {isDragActive ? (
                <p>Drop the campus image here</p>
              ) : (
                <p>Drag & drop a campus image, or click to select</p>
              )}
            </>
          )}
        </div>
      </div>

      {preview && !isLoading && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Preview:</h3>
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
            <img
              src={preview}
              alt="Uploaded preview"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Upload a clear photo of your campus surroundings for accurate detection
      </p>
    </div>
  );
}
