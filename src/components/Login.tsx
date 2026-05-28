import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1F3D52',
        color: '#fff',
        padding: '32px',
        boxSizing: 'border-box',
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}datev.png`}
        alt="Datev logo"
        style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          width: '140px',
          height: '140px',
          objectFit: 'contain',
          marginBottom: '24px',
        }}
      />
      <h6 style={{ margin: '0 0 16px', fontSize: '2rem', color: '#fff' }}>Access denied</h6>
      <button
        onClick={login}
        style={{
          padding: '12px 24px',
          fontSize: '12px',
          backgroundColor: '#AAE651',
          color: '#000',
          border: '1px solid #9adb3c',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 700,
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#9adb3c')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#AAE651')}
      >
        Login with Keycloak
      </button>
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

export default Login;
