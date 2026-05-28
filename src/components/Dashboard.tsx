import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import oid4vcService from '../services/oid4vc.service';
import QRCode from 'react-qr-code';

const Dashboard = () => {
  const { logout } = useAuth();
  const [offerDeeplink, setOfferDeeplink] = useState<string | null>(null);
  const [offerDeeplinkVal, setOfferDeeplinkVal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showByReferenceCard, setShowByReferenceCard] = useState(false);

  useEffect(() => {
    prepareQr();
  }, []);

  const prepareQr = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Retrieve credential offer links
      // Each call creates a unique offer in Keycloak
      const [offerLink, offerLinkVal] = await Promise.all([
        oid4vcService.getCredentialOfferDeeplink(true), // By reference
        oid4vcService.getCredentialOfferDeeplink(false), // By value
      ]);

      // Update state with retrieved data
      setOfferDeeplink(offerLink);
      setOfferDeeplinkVal(offerLinkVal);
    } catch (error) {
      console.error('Failed to retrieve credential offer', error);
      setError('Failed to retrieve credential offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '32px 24px 56px',
        backgroundColor: '#1F3D52',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1120px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '40px',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={`${import.meta.env.BASE_URL}datev.png`}
            alt="Datev logo"
            style={{ width: '64px', height: '64px', objectFit: 'contain' }}
          />
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, color: '#d7e4eb', fontSize: '0.95rem', letterSpacing: 0.2 }}>
              Credential Offer
            </p>
            <h2 style={{ margin: '4px 0 0', color: '#fff', fontSize: '1.8rem', fontWeight: 700 }}>
              Wallet Access
            </h2>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            backgroundColor: '#AAE651',
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 700,
          }}
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: '1120px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            marginBottom: '20px',
            fontWeight: 700,
            color: '#fff',
          }}
        >
          You are logged in
        </h1>

        <div
          style={{
            fontSize: '1.125rem',
            marginBottom: '20px',
            lineHeight: '1.6',
            color: '#d7e4eb',
          }}
        >
          <p style={{ margin: 0 }}>Please scan the displayed QR code with your EUDI Wallet App.</p>
          <p style={{ margin: 0, fontSize: '1rem' }}>
            Alternatively, click on the offer link to open it directly in your wallet.
          </p>
        </div>

        {!isLoading && !error && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              margin: '24px 0 32px',
              color: '#fff',
            }}
          >
            <Toggle
              label="Show by reference"
              checked={showByReferenceCard}
              onChange={() => setShowByReferenceCard((current) => !current)}
            />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
          }}
        >
          {/* Loading state */}
          {isLoading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(255, 255, 255, 0.2)',
                  borderTop: '4px solid #AAE651',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ margin: 0, color: '#d7e4eb' }}>Renewing credential offer...</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div
              style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #f5c6cb',
                gridColumn: '1 / -1',
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
              <button
                onClick={prepareQr}
                style={{
                  marginTop: '15px',
                  backgroundColor: '#AAE651',
                  color: '#000',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Credential offer loaded (by value) */}
          {!isLoading &&
            !error &&
            offerDeeplinkVal &&
            showCredentialOffer(offerDeeplinkVal, 'By value', {
              showUrl: true,
              qrSize: 360,
            })}

          {/* Credential offer loaded (by reference) */}
          {!isLoading &&
            !error &&
            showByReferenceCard &&
            offerDeeplink &&
            showCredentialOffer(offerDeeplink, 'By reference', {
              showUrl: true,
              qrSize: 300,
            })}

          {/* Renew button */}
          {!isLoading && !error && (
            <div style={{ marginTop: '8px', gridColumn: '1 / -1' }}>
              <button
                onClick={prepareQr}
                style={{
                  backgroundColor: '#AAE651',
                  color: '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                Renew credential offer
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

interface CredentialOfferOptions {
  showUrl: boolean;
  qrSize: number;
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      <span>{label}</span>
      <button
        type="button"
        aria-pressed={checked}
        aria-label={label}
        onClick={onChange}
        style={{
          width: '54px',
          height: '30px',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.28)',
          backgroundColor: checked ? '#AAE651' : 'rgba(255, 255, 255, 0.18)',
          position: 'relative',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '27px' : '3px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: checked ? '#000' : '#fff',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </label>
  );
}

function showCredentialOffer(offerLink: string, title: string, options: CredentialOfferOptions) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        padding: '28px 24px 32px',
        backgroundColor: '#284c63',
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.18)',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <p
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            margin: 0,
            color: '#fff',
            fontStyle: 'italic',
          }}
        >
          {title}
        </p>
        {options.showUrl ? (
          <div
            style={{
              width: '100%',
              minHeight: '148px',
              padding: '0 8px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <a
              href={offerLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#AAE651',
                display: 'block',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                lineHeight: 1.35,
                textAlign: 'center',
                textDecorationThickness: '1px',
              }}
            >
              {offerLink}
            </a>
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              minHeight: '148px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p style={{ margin: 0, color: '#d7e4eb' }}>URL hidden</p>
          </div>
        )}
      </div>
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: options.qrSize === 360 ? '400px' : '400px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          margin: '0 auto',
        }}
      >
        <QRCode
          value={offerLink}
          size={options.qrSize}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          viewBox={`0 0 ${options.qrSize} ${options.qrSize}`}
        />
      </div>
    </div>
  );
}

export default Dashboard;
