import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Bell,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  File,
  Home,
  Landmark,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Settings,
  Wallet,
  CalendarDays,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import oid4vpService from '../services/oid4vp.service';
import './LoanApplication.css';

const PRESENTATION_POLL_INTERVAL_MS = 2000;
const PRESENTATION_REQUEST_TIMEOUT_MS = 5 * 60 * 1000;

/* ─────────────────────────── component ─────────────────────────── */
const DocumentShieldIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '8px' }}>
    {/* Blue document / card container */}
    <rect x="16" y="10" width="32" height="44" rx="6" fill="#EFF6FF" stroke="#1E40AF" strokeWidth="2.5" />
    <path d="M22 18H42" stroke="#1E40AF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 26H34" stroke="#1E40AF" strokeWidth="2.5" strokeLinecap="round" />

    {/* Green shield badge */}
    <circle cx="44" cy="44" r="10" fill="#FFFFFF" />
    <path d="M44 36C44 36 50 38.5 50 42.5C50 47.5 44 51 44 51C44 51 38 47.5 38 42.5C38 38.5 44 36 44 36Z" fill="#10B981" stroke="#10B981" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M41.5 43.5L43 45L46.5 41" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LoanApplication = () => {
  const navigate = useNavigate();
  const { isLoading: isAuthLoading } = useAuth();
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'requesting' | 'pending' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (status !== 'pending' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  // Static demo user info (no dynamic profile needed)
  const userName = 'Max Mustermann';
  const initials = 'MM';

  const startPresentation = async () => {
    setStatus('requesting');
    setQrPayload(null);
    setTransactionId(null);
    setTimeLeft(300);
    try {
      const res = await oid4vpService.createPresentationRequest();
      setQrPayload(res.authorization_request);
      setTransactionId(res.transaction_id);
      setStatus('pending');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Fehler beim Abrufen des QR-Codes.');
    }
  };

  useEffect(() => {
    document.title = 'SecureBank';
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <circle cx="12" cy="12" r="12" fill="#1e3a8a"/>
          <g transform="translate(4, 4) scale(0.666)" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <line x1="3" y1="22" x2="21" y2="22"></line>
            <line x1="6" y1="18" x2="6" y2="11"></line>
            <line x1="10" y1="18" x2="10" y2="11"></line>
            <line x1="14" y1="18" x2="14" y2="11"></line>
            <line x1="18" y1="18" x2="18" y2="11"></line>
            <line x1="12" y1="2" x2="20" y2="8"></line>
            <line x1="12" y1="2" x2="4" y2="8"></line>
            <line x1="3" y1="8" x2="21" y2="8"></line>
          </g>
        </svg>
      `.trim())}`;
    }
    // Wait for auth to finish before starting the presentation request
    if (!isAuthLoading) {
      startPresentation();
    }
  }, [isAuthLoading]);

  useEffect(() => {
    if (status !== 'pending' || !transactionId) return;
    let isActive = true;
    let isPolling = false;
    const startedAt = Date.now();

    const interval = setInterval(async () => {
      if (Date.now() - startedAt >= PRESENTATION_REQUEST_TIMEOUT_MS) {
        clearInterval(interval);
        return;
      }

      if (isPolling) return;
      isPolling = true;

      try {
        const res = await oid4vpService.pollPresentationStatus(transactionId);
        if (!isActive) return;

        const presentationStatus = res.status.toUpperCase();
        if (presentationStatus === 'SUCCESS') {
          setStatus('success');
          clearInterval(interval);
        } else if (presentationStatus === 'ERROR') {
          setStatus('error');
          setErrorMessage(res.errorDescription || 'Ein Fehler ist aufgetreten.');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to poll presentation status', error);
      } finally {
        isPolling = false;
      }
    }, PRESENTATION_POLL_INTERVAL_MS);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [status, transactionId]);

  /* ── Main page ── */
  return (
    <div className="loan-page">
      {/* ── Header ── */}
      <header className="loan-header">
        <div className="loan-logo">
          <span className="loan-logo-icon">
            <Landmark size={18} />
          </span>
          <div>
            <div className="loan-logo-name">SecureBank</div>
            <div className="loan-logo-tag">Verlässlich. Persönlich. Digital.</div>
          </div>
        </div>
        <div className="loan-header-right">
          <span className="loan-header-link">
            <Mail size={16} /> Nachrichten
          </span>
          <span className="loan-header-link">
            <Bell size={16} /> Benachrichtigungen
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="loan-avatar">{initials}</div>
            <span className="loan-username">
              {userName} <ChevronDown size={14} />
            </span>
          </div>
        </div>
      </header>

      <div className="loan-body">
        {/* ── Sidebar ── */}
        <aside className="loan-sidebar">
          <nav>
            {[
              { label: 'Übersicht', icon: <Home size={16} /> },
              { label: 'Konten', icon: <CreditCard size={16} /> },
              { label: 'Überweisungen', icon: <ArrowLeftRight size={16} /> },
              { label: 'Daueraufträge', icon: <Clock size={16} /> },
              { label: 'Karten', icon: <CreditCard size={16} /> },
            ].map(({ label, icon }) => (
              <div key={label} className="loan-nav-item">
                {icon} {label}
              </div>
            ))}
            <div className="loan-nav-item active">
              <Landmark size={16} /> Kredite
            </div>

            {[
              { label: 'Dokumente', icon: <File size={16} /> },
              { label: 'Postfach', icon: <Mail size={16} /> },
              { label: 'Einstellungen', icon: <Settings size={16} /> },
            ].map(({ label, icon }) => (
              <div key={label} className="loan-nav-item">
                {icon} {label}
              </div>
            ))}
          </nav>

          <div className="loan-sidebar-footer">
            <div className="loan-sidebar-help">
              Haben Sie Fragen?
              <br />
              Wir sind für Sie da.
            </div>
            <button className="loan-contact-btn">
              <Phone size={14} /> Kontakt aufnehmen
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main
          className="loan-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100%',
            backgroundColor: '#F8FAFC',
            padding: '40px 20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '860px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {/* Top Icon & Title */}
            {status !== 'success' && (
              <div style={{ textAlign: 'center' }}>
                <DocumentShieldIcon />
                <h1
                  style={{
                    fontSize: 'clamp(1.5rem, 2.5vw, 1.85rem)',
                    fontWeight: 700,
                    color: '#0F172A',
                    marginTop: '16px',
                    marginBottom: '8px',
                    lineHeight: 1.25,
                  }}
                >
                  Für Ihren Kreditantrag benötigen wir einen Gehaltsnachweis
                </h1>
                <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                  Teilen Sie Ihren DATEV-Gehaltsnachweis sicher über Ihre EUDI-Wallet.
                </p>
              </div>
            )}


            {/* Success State / Main Card */}
            {status === 'success' ? (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '24px',
                }}
              >
                {/* Top Green Check Circle */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#22C55E',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    marginBottom: '8px',
                  }}
                >
                  <Check size={36} strokeWidth={3} />
                </div>

                {/* Title and Subtitle */}
                <div style={{ textAlign: 'center' }}>
                  <h1
                    style={{
                      fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                      fontWeight: 700,
                      color: '#0F172A',
                      margin: '0 0 8px',
                      lineHeight: 1.2,
                    }}
                  >
                    Kredit bewilligt
                  </h1>
                  <p style={{ fontSize: '16px', color: '#475569', margin: 0 }}>
                    Ihr Kredit über <span style={{ color: '#22C55E', fontWeight: 700 }}>10.000 €</span> wurde genehmigt.
                  </p>
                </div>

                {/* Checked notice */}
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <div style={{ color: '#16A34A', fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>
                    Gehaltsnachweis erfolgreich geprüft.
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5 }}>
                    Der von DATEV eG ausgestellte Gehaltsnachweis wurde erfolgreich mit Ihrer EUDI-Wallet verifiziert.
                  </p>
                </div>

                {/* 4-Column Card */}
                <div
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    padding: '24px 16px',
                    marginTop: '8px',
                  }}
                >
                  {/* Column 1: Kreditbetrag */}
                  <div
                    style={{
                      flex: '1 1 150px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '16px',
                      borderRight: '1px solid #F1F5F9',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#F0FDF4',
                        borderRadius: '50%',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <Wallet size={18} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Kreditbetrag</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginTop: '4px' }}>10.000 €</span>
                  </div>

                  {/* Column 2: Kreditart */}
                  <div
                    style={{
                      flex: '1 1 150px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '16px',
                      borderRight: '1px solid #F1F5F9',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#F0FDF4',
                        borderRadius: '50%',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <CalendarDays size={18} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Kreditart</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginTop: '4px' }}>Ratenkredit</span>
                  </div>

                  {/* Column 3: Laufzeit */}
                  <div
                    style={{
                      flex: '1 1 150px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '16px',
                      borderRight: '1px solid #F1F5F9',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#F0FDF4',
                        borderRadius: '50%',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <Clock size={18} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Laufzeit</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginTop: '4px' }}>48 Monate</span>
                  </div>

                  {/* Column 4: Status */}
                  <div
                    style={{
                      flex: '1 1 150px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#F0FDF4',
                        borderRadius: '50%',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <Check size={18} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Status</span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: '#DCFCE7',
                        color: '#16A34A',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        marginTop: '6px',
                      }}
                    >
                      Bewilligt
                    </span>
                  </div>
                </div>

                {/* Bottom E-Mail Notice Banner */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '560px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #DBEAFE',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginTop: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#DBEAFE',
                      borderRadius: '50%',
                      color: '#1E40AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', color: '#1E40AF', fontWeight: 600 }}>
                      Sie erhalten in Kürze eine Bestätigung per E-Mail
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                      Alle weiteren Informationen finden Sie in Ihrem Postfach.
                    </div>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  onClick={() => navigate('/')}
                  style={{
                    marginTop: '24px',
                    padding: '12px 32px',
                    backgroundColor: '#1E3A8A',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1E3A8A')}
                >
                  Zur Übersicht
                </button>
              </div>
            ) : (
              /* Two-Column Card */
              <div
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  width: '100%',
                  display: 'flex',
                  flexWrap: 'wrap',
                  overflow: 'hidden',
                }}
              >
                {/* Left Column: Requested Data */}
                <div
                  style={{
                    flex: '1 1 350px',
                    padding: '36px',
                    borderRight: '1px solid #F1F5F9',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A8A', marginBottom: '8px' }}>
                    Angeforderte Daten
                  </h2>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px', lineHeight: 1.5 }}>
                    SecureBank benötigt folgende Informationen aus Ihrem Gehaltsnachweis:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      'Arbeitgeber',
                      'Nettogehalt',
                      'Abrechnungszeitraum',
                      'Ausstellungsdatum',
                    ].map((item) => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#DCFCE7',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#15803D',
                            flexShrink: 0,
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: QR Code */}
                <div
                  style={{
                    flex: '1 1 350px',
                    padding: '36px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FAFAFA',
                  }}
                >
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A8A', marginBottom: '8px', textAlign: 'center' }}>
                    QR-Code mit Ihrer EUDI-Wallet scannen
                  </h2>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px', lineHeight: 1.5, textAlign: 'center' }}>
                    Nach dem Scannen werden die angeforderten Daten sicher an SecureBank übertragen.
                  </p>

                  {/* QR Box */}
                  {status === 'loading' || status === 'requesting' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          border: '3px solid #E2E8F0',
                          borderTop: '3px solid #1E3A8A',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginBottom: '12px',
                        }}
                      />
                      <span style={{ fontSize: '13px', color: '#64748B' }}>Wird geladen…</span>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                  ) : status === 'error' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', textAlign: 'center', padding: '16px' }}>
                      <span style={{ color: '#EF4444', fontSize: '13px', fontWeight: 500, marginBottom: '16px', lineHeight: 1.5 }}>
                        {errorMessage}
                      </span>
                      <button
                        onClick={startPresentation}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          backgroundColor: '#1E3A8A',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <RefreshCw size={12} /> Code aktualisieren
                      </button>
                    </div>
                  ) : qrPayload ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '16px',
                          backgroundColor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '232px',
                          height: '232px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <QRCode
                          value={qrPayload}
                          size={200}
                          style={{ height: 'auto', maxWidth: '100%', width: '100%', display: 'block' }}
                          viewBox="0 0 256 256"
                        />
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> Gültig für {formatTime(timeLeft)} Minuten
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Bottom Security Notice */}
            {status !== 'success' && (
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                }}
              >
                <Lock size={16} color="#1E40AF" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#1E40AF', fontWeight: 500, lineHeight: '1.4', textAlign: 'center' }}>
                  Ihre Daten werden ausschließlich verschlüsselt übertragen und gemäß höchsten Sicherheitsstandards verarbeitet.
                </span>
              </div>
            )}


            {/* Why do we need this Accordion */}
            {status !== 'success' && (
              <div style={{ textAlign: 'center', width: '100%', marginTop: '8px' }}>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1E40AF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Warum benötigen wir das?
                  <ChevronDown
                    size={14}
                    style={{
                      transform: showExplanation ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
                {showExplanation && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#64748B',
                      maxWidth: '500px',
                      margin: '10px auto 0',
                      lineHeight: '1.5',
                      textAlign: 'center',
                    }}
                  >
                    Um Ihren Kreditantrag schnell und ohne Papierkram prüfen zu können, benötigen wir eine verifizierte Bestätigung Ihres Einkommens. Über die EUDI-Wallet können Sie diese Daten direkt von Ihrem Gehaltsnachweis sicher und digital übermitteln.
                  </p>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default LoanApplication;
