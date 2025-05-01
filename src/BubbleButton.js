export function BubbleButton({ onAdd }) {
  return (
    <button
      onClick={onAdd}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        padding: '10px 15px',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
      }}
    >
      + Bulle
    </button>
  );
}