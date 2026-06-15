import { useEffect, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRuntimeConfig } from '../config/runtime-config';
import {
  S_ACCESS_TOKEN,
  S_TOKEN_EXPIRY,
  S_ID_TOKEN,
  S_CODE_VERIFIER,
  S_REFRESH_TOKEN,
} from './LandingPageGuard';

const DocumentShieldIconLarge = () => (
  <svg
    width="96"
    height="96"
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginBottom: '24px' }}
  >
    {/* Document icon in white stroke */}
    <path
      d="M56 12H28C24.6863 12 22 14.6863 22 18V78C22 81.3137 24.6863 84 28 84H68C71.3137 84 74 81.3137 74 78V30L56 12Z"
      stroke="#FFFFFF"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Folded corner line */}
    <path
      d="M56 12V30H74"
      stroke="#FFFFFF"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Text lines in document */}
    <path d="M32 40H60" stroke="#9ece50" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M32 50H50" stroke="#9ece50" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M32 60H42" stroke="#9ece50" strokeWidth="3.5" strokeLinecap="round" />

    {/* Green shield on the bottom right */}
    {/* Shield background circle */}
    <circle cx="68" cy="68" r="16" fill="#1F3D52" />
    {/* Shield path */}
    <path
      d="M68 56C68 56 78 59 78 66C78 74 68 80 68 80C68 80 58 74 58 66C58 59 68 56 68 56Z"
      fill="#9ece50"
      stroke="#9ece50"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Checkmark inside shield */}
    <path
      d="M63.5 67.5L66.5 70.5L72.5 63.5"
      stroke="#1F3D52"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Mein Gehaltsnachweis';
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = `${import.meta.env.BASE_URL}datev.png`;
    }
  }, []);

  const handleLogout = () => {
    const keycloakUrl = getRuntimeConfig('VITE_KEYCLOAK_URL');
    const realm = getRuntimeConfig('VITE_KEYCLOAK_REALM');
    const clientId = getRuntimeConfig('VITE_KEYCLOAK_CLIENT_ID');

    const idToken = sessionStorage.getItem(S_ID_TOKEN);

    // Clear local session storage
    sessionStorage.removeItem(S_ACCESS_TOKEN);
    sessionStorage.removeItem(S_TOKEN_EXPIRY);
    sessionStorage.removeItem(S_REFRESH_TOKEN);
    sessionStorage.removeItem(S_ID_TOKEN);
    sessionStorage.removeItem(S_CODE_VERIFIER);

    if (keycloakUrl && realm) {
      const authBase = `${keycloakUrl}/realms/${realm}/protocol/openid-connect`;
      const redirectUri = `${window.location.origin}${window.location.pathname}`;

      const logoutParams = new URLSearchParams();
      if (idToken) {
        logoutParams.append('id_token_hint', idToken);
        logoutParams.append('post_logout_redirect_uri', redirectUri);
      } else {
        logoutParams.append('client_id', clientId);
        logoutParams.append('post_logout_redirect_uri', redirectUri);
      }

      window.location.href = `${authBase}/logout?${logoutParams.toString()}`;
    } else {
      window.location.reload();
    }
  };
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
      {/* Abmelden (Logout) button in the top-right corner */}
      <button
        type="button"
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '32px',
          right: '32px',
          padding: '10px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: '#e5e7eb',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.color = '#e5e7eb';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Abmelden
      </button>

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
            transform: 'translateY(-2vh)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <DocumentShieldIconLarge />

          <h1
            style={{
              margin: '0 0 24px',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
              lineHeight: 1.15,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Vom Gehaltsnachweis
            <br />
            zum Kreditantrag
          </h1>

          <p
            style={{
              fontSize: '17px',
              color: '#d1d5db',
              maxWidth: '560px',
              margin: '0 auto 56px',
              lineHeight: 1.6,
            }}
          >
            Diese Demo zeigt die Ausstellung und Nutzung eines digitalen Gehaltsnachweises mit der
            EUDI-Wallet.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
              flexWrap: 'wrap',
            }}
          >
            <button
              id="btn-mein-gehaltsnachweis"
              type="button"
              style={demoButtonStyle}
              onClick={() => navigate('/dashboard')}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#8cb83f';
                e.currentTarget.style.borderColor = '#7fa834';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#9ece50';
                e.currentTarget.style.borderColor = '#8cb83f';
              }}
              title="Gehaltsnachweis als digitalen Nachweis in Ihrer EUDI-Wallet erhalten"
            >
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  lineHeight: 1.3,
                }}
              >
                <span>Mein</span>
                <span>Gehaltsnachweis</span>
              </span>
            </button>
            <button
              type="button"
              style={demoButtonStyle}
              title="Demo-Platzhalter fuer den Verifikationsablauf eines Kreditantrags"
              onClick={() => navigate('/kreditantrag')}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#8cb83f';
                e.currentTarget.style.borderColor = '#7fa834';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#9ece50';
                e.currentTarget.style.borderColor = '#8cb83f';
              }}
            >
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  lineHeight: 1.3,
                }}
              >
                <span>Kreditantrag</span>
              </span>
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
  width: '280px',
  height: '76px',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 24px',
  fontSize: '1.05rem',
  backgroundColor: '#9ece50',
  color: '#000',
  border: '1px solid #8cb83f',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 700,
  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.22)',
  boxSizing: 'border-box',
  flexShrink: 0,
  transition: 'all 0.2s ease',
};

export default Login;
