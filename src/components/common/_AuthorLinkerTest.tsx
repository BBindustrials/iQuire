import React, { useState } from 'react';
import { AuthorLinker, type AuthorLinkerValue } from '../../components/common/AuthorLinker';

export const AuthorLinkerTest: React.FC = () => {
  const [value, setValue] = useState<AuthorLinkerValue>({
    author_profile_id: null,
    author_name: '',
    author_role: '',
    author_avatar_url: '',
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
      <h1>AuthorLinker Test</h1>
      <AuthorLinker value={value} onChange={setValue} />
      <details style={{ marginTop: '1.5rem' }}>
        <summary>Value output</summary>
        <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      </details>
    </div>
  );
};