// ============================================================================
// iQuire — JsonArrayEditor
// ============================================================================
// Simple list editor: add / edit / remove / reorder string items.
// ============================================================================

import React, { useState } from 'react';
import styles from './JsonArrayEditor.module.css';

interface JsonArrayEditorProps {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  helperText?: string;
}

export const JsonArrayEditor: React.FC<JsonArrayEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Add an item…',
  helperText,
}) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number, next: string) => {
    const copy = [...value];
    copy[index] = next;
    onChange(copy);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...value];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    onChange(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index === value.length - 1) return;
    const copy = [...value];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    onChange(copy);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>

      {/* Existing items */}
      {value.length > 0 && (
        <ul className={styles.list}>
          {value.map((item, index) => (
            <li key={index} className={styles.listItem}>
              <input
                type="text"
                value={item}
                onChange={(e) => handleEdit(index, e.target.value)}
                className={styles.itemInput}
              />
              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => handleMoveDown(index)}
                  disabled={index === value.length - 1}
                  title="Move down"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={`${styles.iconBtn} ${styles.iconDanger}`}
                  onClick={() => handleRemove(index)}
                  title="Remove"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add new */}
      <div className={styles.addRow}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.addInput}
        />
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleAdd}
          disabled={!input.trim()}
        >
          + Add
        </button>
      </div>

      {helperText && <p className={styles.helper}>{helperText}</p>}
    </div>
  );
};