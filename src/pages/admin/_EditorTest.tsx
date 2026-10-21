import React, { useState } from 'react';
import { RichTextEditor } from '../../components/common/RichTextEditor';

export const EditorTest: React.FC = () => {
  const [html, setHtml] = useState('<p>Hello <strong>world</strong>!</p>');

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Rich Text Editor Test</h1>
      <RichTextEditor
        value={html}
        onChange={setHtml}
        placeholder="Type something…"
      />
      <details style={{ marginTop: '1.5rem' }}>
        <summary>HTML output</summary>
        <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
          {html}
        </pre>
      </details>
    </div>
  );
};