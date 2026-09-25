// ============================================================================
// iQuire — ImageUploader Component
// ============================================================================
// Drag & drop / click to upload. Compresses client-side, shows preview,
// and returns the final Supabase Storage URL.
// ============================================================================

import React, { useRef, useState, useCallback } from 'react';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  /** Current image URL (for edit mode) */
  value?: string | null;
  /** Called with the new URL after successful upload */
  onChange: (url: string) => void;
  /** Upload function — must return { success, url?, error? } */
  upload: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  /** Optional delete function — called when user removes the image */
  onRemove?: () => void;
  /** Optional label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Aspect ratio for the preview. Default 1/1 */
  aspect?: 'square' | 'wide' | 'tall';
  /** Optional max file size for validation (default 1 MB) */
  maxSizeMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  upload,
  onRemove,
  label = 'Photo',
  helperText = 'JPEG, PNG, or WebP. Max 1 MB. Larger files are compressed automatically.',
  aspect = 'square',
  maxSizeMB = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------------------------------
  // Handle a selected/dropped file
  // --------------------------------------------------------------------------
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }

      // Note: compression runs inside `upload`, so we accept larger source files.
      // We only reject absurdly large files (> 10 MB) to protect bandwidth.
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be under 10 MB. It will be compressed to ≤ 1 MB.');
        return;
      }

      setIsUploading(true);
      const result = await upload(file);
      setIsUploading(false);

      if (!result.success || !result.url) {
        setError(result.error ?? 'Upload failed.');
        return;
      }

      onChange(result.url);
    },
    [upload, onChange]
  );

  // --------------------------------------------------------------------------
  // Input change
  // --------------------------------------------------------------------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  // --------------------------------------------------------------------------
  // Drag & drop
  // --------------------------------------------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // --------------------------------------------------------------------------
  // Remove
  // --------------------------------------------------------------------------
  const handleRemove = () => {
    if (onRemove) onRemove();
    onChange('');
    setError(null);
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}

      <div
        className={`${styles.dropzone} ${styles[`aspect-${aspect}`]} ${
          isDragging ? styles.dragging : ''
        } ${value ? styles.hasImage : ''} ${
          isUploading ? styles.uploading : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload image"
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className={styles.preview} />
            {!isUploading && (
              <div className={styles.previewOverlay}>
                <button
                  type="button"
                  className={styles.replaceBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.placeholder}>
            {isUploading ? (
              <>
                <div className={styles.spinner} />
                <span className={styles.placeholderText}>Uploading…</span>
              </>
            ) : (
              <>
                <div className={styles.placeholderIcon}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 8L12 3L7 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className={styles.placeholderTitle}>
                  Click to upload or drag & drop
                </span>
                <span className={styles.placeholderSub}>
                  Auto-compressed to ≤ {maxSizeMB} MB
                </span>
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className={styles.hiddenInput}
          tabIndex={-1}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {!error && helperText && <p className={styles.helper}>{helperText}</p>}
    </div>
  );
};