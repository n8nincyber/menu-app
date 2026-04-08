import React, { useState } from 'react';

const tableWrapperStyle = {
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  border: '1px solid var(--border-glass)',
  background: 'rgba(15, 17, 30, 0.5)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
};

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontFamily: 'var(--font-mono)',
  color: 'var(--accent-2)',
  background: 'rgba(99, 102, 241, 0.08)',
  borderBottom: '1px solid var(--border-accent)',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '9px 14px',
  borderBottom: '1px solid var(--border-glass)',
  color: 'var(--text-primary)',
  verticalAlign: 'top',
};

const categoryBadgeStyle = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '100px',
  fontSize: '11px',
  fontWeight: 500,
  background: 'rgba(168, 85, 247, 0.12)',
  color: 'var(--accent-2)',
  border: '1px solid rgba(168, 85, 247, 0.2)',
  whiteSpace: 'nowrap',
};

const priceStyle = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  color: '#34d399',
  whiteSpace: 'nowrap',
};

const footerStyle = {
  padding: '8px 14px',
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)',
  textAlign: 'right',
  background: 'rgba(99, 102, 241, 0.04)',
  borderTop: '1px solid var(--border-glass)',
};

const filterBarStyle = {
  display: 'flex',
  gap: '6px',
  padding: '8px 14px',
  overflowX: 'auto',
  background: 'rgba(99, 102, 241, 0.04)',
  borderBottom: '1px solid var(--border-glass)',
};

const filterBtnStyle = (active) => ({
  padding: '3px 10px',
  borderRadius: '100px',
  fontSize: '11px',
  fontFamily: 'var(--font-mono)',
  border: active ? '1px solid var(--accent-1)' : '1px solid var(--border-glass)',
  background: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
  color: active ? 'var(--accent-1)' : 'var(--text-secondary)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s var(--ease-out)',
});

function MenuTable({ items, restaurant }) {
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(items.map((i) => i.category))];
  const filtered = filter === 'All' ? items : items.filter((i) => i.category === filter);

  return (
    <div style={tableWrapperStyle}>
      {/* Category filter bar */}
      {categories.length > 2 && (
        <div style={filterBarStyle}>
          {categories.map((cat) => (
            <button key={cat} style={filterBtnStyle(filter === cat)} onClick={() => setFilter(cat)}>
              {cat}
            </button>
          ))}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Item Name</th>
              <th style={thStyle}>Category</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  animation: `fadeInUp 0.3s var(--ease-out) ${idx * 30}ms both`,
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')
                }
              >
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>
                  <span style={categoryBadgeStyle}>{item.category}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <span style={priceStyle}>{item.price}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={footerStyle}>
        {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        {filter !== 'All' ? ` in ${filter}` : ''}
        {restaurant ? ` · ${restaurant}` : ''}
      </div>
    </div>
  );
}

export default MenuTable;
