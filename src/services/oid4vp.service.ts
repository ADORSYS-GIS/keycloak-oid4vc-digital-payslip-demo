function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((x) => charset[x % charset.length])
    .join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(buffer: ArrayBuffer): string {
  let str = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function generateCodeChallenge(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(128);
  const hashed = await sha256(verifier);
  const challenge = base64urlencode(hashed);
  return { verifier, challenge };
}

export interface PresentationRequestResult {
  authorization_request: string;
  transaction_id: string;
}

export interface PresentationStatusResult {
  status: 'pending' | 'SUCCESS' | 'ERROR' | string;
  error?: string;
  errorDescription?: string;
}

class Oid4vpService {
  private getBaseUrl(): string {
    const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
    const realm = import.meta.env.VITE_KEYCLOAK_REALM;
    return `${keycloakUrl}/realms/${realm}`;
  }

  private getClientId(): string {
    return import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'oid4vc-demo-public';
  }

  async createPresentationRequest(): Promise<PresentationRequestResult> {
    const { challenge } = await generateCodeChallenge();
    const clientId = this.getClientId();
    const url = `${this.getBaseUrl()}/oid4vp-auth/request?client_id=${clientId}&code_challenge=${challenge}&code_challenge_method=S256`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create presentation request: ${response.statusText}`);
    }

    return response.json();
  }

  async pollPresentationStatus(transactionId: string): Promise<PresentationStatusResult> {
    const url = `${this.getBaseUrl()}/oid4vp-auth/status/${transactionId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to poll status: ${response.statusText}`);
    }

    return response.json();
  }
}

export default new Oid4vpService();
