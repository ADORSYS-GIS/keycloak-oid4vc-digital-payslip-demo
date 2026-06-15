import { getRuntimeConfig } from '../config/runtime-config';

function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const maxValidByte = 256 - (256 % charset.length);
  let result = '';
  const tempBuffer = new Uint8Array(Math.ceil(length * 1.5));
  while (result.length < length) {
    window.crypto.getRandomValues(tempBuffer);
    for (let i = 0; i < tempBuffer.length && result.length < length; i++) {
      const b = tempBuffer[i];
      if (b < maxValidByte) {
        result += charset[b % charset.length];
      }
    }
  }
  return result;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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

export type PresentationStatus = 'pending' | 'SUCCESS' | 'ERROR';

export interface PresentationStatusResult {
  status: PresentationStatus;
  error?: string;
  errorDescription?: string;
}

const PKCE_CODE_VERIFIER_STORAGE_KEY = 'oid4vp_pkce_code_verifier';

class Oid4vpService {
  private getBaseUrl(): string {
    const keycloakUrl = getRuntimeConfig('VITE_KEYCLOAK_URL');
    const realm = getRuntimeConfig('VITE_KEYCLOAK_REALM');
    return `${keycloakUrl}/realms/${realm}`;
  }

  private getClientId(): string {
    return getRuntimeConfig('VITE_KEYCLOAK_CLIENT_ID', 'oid4vc-demo-public');
  }

  storeCodeVerifier(verifier: string): void {
    sessionStorage.setItem(PKCE_CODE_VERIFIER_STORAGE_KEY, verifier);
  }

  getStoredCodeVerifier(): string | null {
    return sessionStorage.getItem(PKCE_CODE_VERIFIER_STORAGE_KEY);
  }

  clearStoredCodeVerifier(): void {
    sessionStorage.removeItem(PKCE_CODE_VERIFIER_STORAGE_KEY);
  }

  async createPresentationRequest(): Promise<PresentationRequestResult> {
    const { verifier, challenge } = await generateCodeChallenge();
    this.storeCodeVerifier(verifier);

    const queryParams = new URLSearchParams({
      client_id: this.getClientId(),
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    const url = `${this.getBaseUrl()}/oid4vp-auth/request?${queryParams.toString()}`;

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
