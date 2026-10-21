// ============================================================================
// iQuire — Rich Text Editor (Phase 14.13.3)
// ============================================================================
// Tiptap-based WYSIWYG editor. Outputs HTML via onChange.
// Reusable across admin content editors.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { uploadBlogImage } from '../../services/blog.service';
import styles from './RichTextEditor.module.css';

// ============================================================================
// Types
// ============================================================================

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  /** Called with a human-readable error message */
  onError?: (message: string) => void;
  /** Optional: disables the editor (e.g., during save) */
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing…',
  minHeight = 320,
  onError,
  disabled = false,
}) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const linkPopoverRef = useRef<HTMLDivElement>(null);

  // --------------------------------------------------------------------------
  // Tiptap instance
  // --------------------------------------------------------------------------
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rte-image',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    editable: !disabled,
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // --------------------------------------------------------------------------
  // Sync external value changes (e.g., when switching between posts)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml && value !== undefined) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  // --------------------------------------------------------------------------
  // Sync editable state
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  // --------------------------------------------------------------------------
  // Close link popover on outside click
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isLinkPopoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        linkPopoverRef.current &&
        !linkPopoverRef.current.contains(e.target as Node)
      ) {
        setIsLinkPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isLinkPopoverOpen]);

  // --------------------------------------------------------------------------
  // Link handlers
  // --------------------------------------------------------------------------
  const openLinkPopover = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href ?? '';
    setLinkUrlInput(previous);
    setIsLinkPopoverOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrlInput.trim();

    if (!url) {
      editor.chain().focus().unsetLink().run();
      setIsLinkPopoverOpen(false);
      return;
    }

    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: normalized })
      .run();

    setIsLinkPopoverOpen(false);
    setLinkUrlInput('');
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setIsLinkPopoverOpen(false);
    setLinkUrlInput('');
  };

  // --------------------------------------------------------------------------
  // Image upload
  // --------------------------------------------------------------------------
  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setIsUploadingImage(true);
    const res = await uploadBlogImage(file);
    setIsUploadingImage(false);

    // Reset the input so the same file can be selected again
    if (imageInputRef.current) imageInputRef.current.value = '';

    if (!res.success || !res.url) {
      onError?.(res.error ?? 'Image upload failed');
      return;
    }

    editor.chain().focus().setImage({ src: res.url }).run();
  };

  // --------------------------------------------------------------------------
  // Loading state
  // --------------------------------------------------------------------------
  if (!editor) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.editorArea} style={{ minHeight }}>
          <div className={styles.loadingState}>Loading editor…</div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.wrapper}>
      {/* ================================================================
          TOOLBAR
          ================================================================ */}
      <div className={styles.toolbar}>
        {/* Text formatting */}
        <ToolbarGroup>
          <ToolbarButton
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={disabled}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={disabled}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            disabled={disabled}
          >
            <span style={{ textDecoration: 'underline' }}>U</span>
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            disabled={disabled}
          >
            <span style={{ textDecoration: 'line-through' }}>S</span>
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarGroup>
          <ToolbarButton
            label="Heading 1"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive('heading', { level: 1 })}
            disabled={disabled}
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive('heading', { level: 2 })}
            disabled={disabled}
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive('heading', { level: 3 })}
            disabled={disabled}
          >
            H3
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarGroup>
          <ToolbarButton
            label="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            disabled={disabled}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={disabled}
          >
            1. List
          </ToolbarButton>
          <ToolbarButton
            label="Blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            disabled={disabled}
          >
            ❝
          </ToolbarButton>
          <ToolbarButton
            label="Inline code"
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            disabled={disabled}
          >
            {'</>'}
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Link + Image */}
        <ToolbarGroup>
          <div className={styles.linkWrapper} ref={linkPopoverRef}>
            <ToolbarButton
              label="Insert link"
              onClick={openLinkPopover}
              isActive={editor.isActive('link')}
              disabled={disabled}
            >
              🔗
            </ToolbarButton>

            {isLinkPopoverOpen && (
              <div className={styles.linkPopover}>
                <input
                  type="url"
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyLink();
                    }
                    if (e.key === 'Escape') {
                      setIsLinkPopoverOpen(false);
                    }
                  }}
                  placeholder="https://example.com"
                  className={styles.linkInput}
                  autoFocus
                />
                <div className={styles.linkPopoverActions}>
                  {editor.isActive('link') && (
                    <button
                      type="button"
                      className={styles.linkRemoveBtn}
                      onClick={removeLink}
                    >
                      Remove
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.linkApplyBtn}
                    onClick={applyLink}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <ToolbarButton
            label="Insert image"
            onClick={handleImageButtonClick}
            isActive={false}
            disabled={disabled || isUploadingImage}
          >
            {isUploadingImage ? '…' : '🖼'}
          </ToolbarButton>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageFileChange}
            className={styles.hiddenInput}
          />
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarGroup>
          <ToolbarButton
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            isActive={false}
            disabled={disabled || !editor.can().undo()}
          >
            ↩
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            isActive={false}
            disabled={disabled || !editor.can().redo()}
          >
            ↪
          </ToolbarButton>
        </ToolbarGroup>
      </div>

      {/* ================================================================
          EDITOR
          ================================================================ */}
      <div
        className={`${styles.editorArea} ${disabled ? styles.disabled : ''}`}
        style={{ minHeight }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface ToolbarGroupProps {
  children: React.ReactNode;
}

const ToolbarGroup: React.FC<ToolbarGroupProps> = ({ children }) => (
  <div className={styles.toolbarGroup}>{children}</div>
);

const ToolbarDivider: React.FC = () => (
  <div className={styles.toolbarDivider} aria-hidden="true" />
);

interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  label,
  onClick,
  isActive,
  disabled,
  children,
}) => (
  <button
    type="button"
    className={`${styles.toolbarBtn} ${isActive ? styles.toolbarBtnActive : ''}`}
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    aria-pressed={isActive}
  >
    {children}
  </button>
);