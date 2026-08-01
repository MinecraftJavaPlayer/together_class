'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb',
        color: '#111827',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        ⚠️ 오류 발생
      </h1>
      <p style={{ marginBottom: '1rem' }}>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
        }}
      >
        다시 시도
      </button>
    </div>
  );
}
