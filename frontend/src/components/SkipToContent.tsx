import React from 'react';

const SkipToContent: React.FC = () => (
  <a
    href="#main-content"
    style={{
      position: 'absolute',
      left: '-1000px',
      top: '8px',
      background: '#1976d2',
      color: 'white',
      padding: '8px 12px',
      zIndex: 2000,
      borderRadius: 4,
    }}
    onFocus={e => {
      (e.currentTarget.style.left = '8px');
    }}
    onBlur={e => {
      (e.currentTarget.style.left = '-1000px');
    }}
  >
    Skip to content
  </a>
);

export default SkipToContent;
