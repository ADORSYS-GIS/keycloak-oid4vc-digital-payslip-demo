import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#1F3D52',
        color: '#fff',
        padding: '32px 40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}datev.png`}
        alt="Datev logo"
        style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          width: '150px',
          height: '150px',
          objectFit: 'contain',
        }}
      />

      <main
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 'min(760px, 100%)',
            transform: 'translateY(6vh)',
          }}
        >
          <h1
            style={{
              margin: '0 0 24px',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(1.85rem, 3vw, 2.55rem)',
              lineHeight: 1.15,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Willkommen bei der EUDI-Gehaltsnachweis-Demo
          </h1>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '86px',
              flexWrap: 'wrap',
            }}
          >
            <button
              id="btn-mein-gehaltsnachweis"
              type="button"
              style={demoButtonStyle}
              onClick={() => navigate('/dashboard')}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#9adb3c')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#AAE651')}
              title="Gehaltsnachweis als digitalen Nachweis in Ihrer EUDI-Wallet erhalten"
            >
              Mein Gehaltsnachweis
            </button>
            <button
              type="button"
              style={demoButtonStyle}
              title="Demo-Platzhalter fuer den Verifikationsablauf eines Kreditantrags"
              onClick={() => navigate('/kreditantrag')}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#9adb3c')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#AAE651')}
            >
              Kreditantrag
            </button>
          </div>
        </div>
      </main>

      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#d1d5db',
          fontSize: '13px',
          opacity: 0.85,
        }}
      >
        {/* Info icon */}
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontStyle: 'italic',
            fontWeight: 600,
            color: '#e5e7eb',
          }}
        >
          i
        </div>

        {/* Text */}
        <div
          style={{
            fontWeight: 700,
            lineHeight: '1.3',
          }}
        >
          <div>This is an experimental playground.</div>
          <div>Made solely for demo purposes.</div>
        </div>
      </div>
    </div>
  );
};

const demoButtonStyle: CSSProperties = {
  width: '192px',
  minHeight: '42px',
  padding: '11px 16px',
  fontSize: '0.88rem',
  backgroundColor: '#AAE651',
  color: '#000',
  border: '1px solid #9adb3c',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 700,
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)',
};

export default Login;
