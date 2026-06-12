import { useEffect, useState, useRef, type ReactNode } from 'react';
import { getRuntimeConfig } from '../config/runtime-config';

// ─── sessionStorage keys ───────────────────────────────────────────────────
const S_CODE_VERIFIER = 'lpg_code_verifier';
const S_ACCESS_TOKEN = 'lpg_access_token';
const S_TOKEN_EXPIRY = 'lpg_token_expiry';

// ─── PKCE helpers ──────────────────────────────────────────────────────────
function generateRandomString(length: number): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => charset[b % charset.length])
    .join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  return window.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(plain)
  );
}

function base64urlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(128);
  const challenge = base64urlEncode(await sha256(verifier));
  return { verifier, challenge };
}

// ─── Token session helpers ─────────────────────────────────────────────────
function getStoredToken(): string | null {
  const token = sessionStorage.getItem(S_ACCESS_TOKEN);
  const expiry = sessionStorage.getItem(S_TOKEN_EXPIRY);
  if (!token || !expiry) return null;
  // Treat as expired 30 s early
  if (Date.now() >= parseInt(expiry, 10) - 30_000) {
    sessionStorage.removeItem(S_ACCESS_TOKEN);
    sessionStorage.removeItem(S_TOKEN_EXPIRY);
    return null;
  }
  return token;
}

function storeToken(accessToken: string, expiresIn: number): void {
  sessionStorage.setItem(S_ACCESS_TOKEN, accessToken);
  sessionStorage.setItem(S_TOKEN_EXPIRY, String(Date.now() + expiresIn * 1_000));
}

// ─── Component ─────────────────────────────────────────────────────────────
interface LandingPageGuardProps {
  children: ReactNode;
}

export default function LandingPageGuard({ children }: LandingPageGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const keycloakUrl = getRuntimeConfig('VITE_KEYCLOAK_URL');
    const realm = getRuntimeConfig('VITE_KEYCLOAK_REALM');
    const clientId = getRuntimeConfig('VITE_KEYCLOAK_CLIENT_ID');
    const clientSecret = getRuntimeConfig('VITE_KEYCLOAK_CLIENT_SECRET');

    if (!keycloakUrl || !realm || !clientId) {
      setError('Keycloak-Konfiguration fehlt.');
      setIsLoading(false);
      return;
    }

    const authBase = `${keycloakUrl}/realms/${realm}/protocol/openid-connect`;
    // redirect_uri must be exactly the current page (no query params)
    const redirectUri = `${window.location.origin}${window.location.pathname}`;

    async function run() {
      // ── 1. Already have a valid session token? ──────────────────────────
      if (getStoredToken()) {
        console.log('[LandingPageGuard] Valid session token found, allowing access.');
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      // ── 2. Keycloak returned an error ───────────────────────────────────
      if (errorParam) {
        console.error('[LandingPageGuard] Error from Keycloak:', errorParam);
        setError(
          'Anmeldung fehlgeschlagen: ' +
          (params.get('error_description') ?? errorParam)
        );
        setIsLoading(false);
        return;
      }

      // ── 3. Returning from Keycloak with an auth code ────────────────────
      if (code) {
        const verifier = sessionStorage.getItem(S_CODE_VERIFIER);
        if (!verifier) {
          console.error('[LandingPageGuard] PKCE verifier missing.');
          setError('Sitzungsfehler – bitte laden Sie die Seite neu.');
          setIsLoading(false);
          return;
        }
        sessionStorage.removeItem(S_CODE_VERIFIER);

        try {
          const body = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            code,
            redirect_uri: redirectUri,
            code_verifier: verifier,
          });
          // *** This is the key difference vs keycloak-js ***
          // Confidential clients require the secret in the token request.
          if (clientSecret) {
            body.append('client_secret', clientSecret);
          }

          console.log('[LandingPageGuard] Exchanging authorization code for tokens…');
          const res = await fetch(`${authBase}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error_description ?? res.statusText);
          }

          const data = await res.json();
          storeToken(data.access_token, data.expires_in ?? 300);

          // Clean up the callback params from the URL without a page reload
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          console.log('[LandingPageGuard] Authentication successful.');
          setIsAuthenticated(true);
        } catch (err) {
          console.error('[LandingPageGuard] Token exchange failed:', err);
          setError('Authentifizierung fehlgeschlagen.');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // ── 4. No token, no code → start the login redirect ────────────────
      console.log('[LandingPageGuard] No session found – redirecting to Keycloak login…');
      const { verifier, challenge } = await generatePKCE();
      sessionStorage.setItem(S_CODE_VERIFIER, verifier);

      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'openid',
        code_challenge: challenge,
        code_challenge_method: 'S256',
      });

      window.location.href = `${authBase}/auth?${authParams.toString()}`;
      // Browser navigates away; no further state updates are needed.
    }

    run();
  }, []);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1F3D52',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              margin: '0 auto 12px',
              border: '3px solid rgba(255,255,255,0.2)',
              borderTop: '3px solid #9ece50',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Verbindung wird hergestellt…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1F3D52',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>
          <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>
            Bitte wenden Sie sich an den Administrator.
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = window.location.pathname;
            }}
            style={{
              marginTop: '16px',
              padding: '10px 24px',
              backgroundColor: '#9ece50',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
