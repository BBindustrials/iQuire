// ============================================================================
// iQuire — ImageField (Phase 14.13)
// ============================================================================
// Reusable image input with two modes:
//   1. Upload from device (compresses + uploads to Supabase Storage)
//   2. Paste a direct image URL
// Shows a live preview with a remove button.
// ============================================================================

import React, { useRef, useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import styles from './ImageField.module.css';

// ============================================================================
// Types
// ============================================================================

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  helperText?: string;
  maxSizeMB?: number;
  aspect?: 'square' | 'wide' | 'free';
}

// ============================================================================
// Compression helper (client-side canvas)
// ============================================================================

const compressImage = (file: File, maxSizeBytes = 500 * 1024): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));

        let { width, height } = img;
        const MAX_DIMENSION = 1600;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const attempt = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Compression failed'));
              if (blob.size <= maxSizeBytes || quality <= 0.3) {
                resolve(blob);
              } else {
                quality -= 0.1;
                attempt();
              }
            },
            'image/jpeg',
            quality
          );
        };
        attempt();
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

// ============================================================================
// Component
// ============================================================================

export const ImageField: React.FC<ImageFieldProps> = ({
  label,
  value,
  onChange,
  bucket = 'site-images',
  helperText,
  maxSizeMB = 5,
  aspect = 'free',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------------------------------
  // Upload handler
  // --------------------------------------------------------------------------
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are supported.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMB} MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const compressed = await compressImage(file, 500 * 1024);

      const ext = 'jpg';
      const filename = `img-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, compressed, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --------------------------------------------------------------------------
  // URL paste handler
  // --------------------------------------------------------------------------
  const handleUrlSubmit = () => {
    const url = urlInput.trim();
    if (!url) return;

    try {
      new URL(url);
    } catch {
      setError('Enter a valid URL (starting with http:// or https://).');
      return;
    }

    onChange(url);
    setUrlInput('');
    setShowUrlInput(false);
    setError(null);
  };

  // --------------------------------------------------------------------------
  // Remove
  // --------------------------------------------------------------------------
  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  const aspectClass =
    aspect === 'square'
      ? styles.previewSquare
      : aspect === 'wide'
      ? styles.previewWide
      : styles.previewFree;

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>

      {/* Preview */}
      <div className={`${styles.preview} ${aspectClass}`}>
        {value ? (
          <>
            <img src={value} alt="Preview" className={styles.previewImg} />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={handleRemove}
              title="Remove image"
              aria-label="Remove image"
            >
              ×
            </button>
          </>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>🖼️</span>
            <span className={styles.placeholderText}>No image set</span>
          </div>
        )}

        {isUploading && (
          <div className={styles.uploadingOverlay}>
            <div className={styles.spinner} />
            <span>Uploading…</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {value ? '📷 Replace' : '📷 Upload image'}
        </button>

        <button
          type="button"
          className={styles.urlToggleBtn}
          onClick={() => setShowUrlInput((v) => !v)}
          disabled={isUploading}
        >
          {showUrlInput ? '× Cancel' : '🔗 Paste URL'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className={styles.hiddenInput}
        />
      </div>

      {/* URL input */}
      {showUrlInput && (
        <div className={styles.urlRow}>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlSubmit();
              }
            }}
            className={styles.urlInput}
          />
          <button
            type="button"
            className={styles.urlSubmitBtn}
            onClick={handleUrlSubmit}
          >
            Use URL
          </button>
        </div>
      )}

      {/* Helpers */}
      {error ? (
        <span className={styles.errorText}>{error}</span>
      ) : helperText ? (
        <span className={styles.helperText}>{helperText}</span>
      ) : null}
    </div>
  );
};