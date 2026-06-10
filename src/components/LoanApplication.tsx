import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Bell,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  File,
  FileText,
  Home,
  Landmark,
  Lock,
  Mail,
  Phone,
  QrCode,
  RefreshCw,
  Settings,
  Smartphone,
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import oid4vpService from '../services/oid4vp.service';
import './LoanApplication.css';

const PRESENTATION_POLL_INTERVAL_MS = 2000;
const PRESENTATION_REQUEST_TIMEOUT_MS = 5 * 60 * 1000;
const PRESENTATION_TIMEOUT_MESSAGE =
  'Der QR-Code ist abgelaufen. Bitte aktualisieren Sie den Code und versuchen Sie es erneut.';

/* ─────────────────────────── component ─────────────────────────── */
const LoanApplication = () => {
  const navigate = useNavigate();
  const { isLoading: isAuthLoading } = useAuth();
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'requesting' | 'pending' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Static demo user info (no dynamic profile needed)
  const userName = 'Max Mustermann';
  const initials = 'MM';

  const startPresentation = async () => {
    setStatus('requesting');
    setQrPayload(null);
    setTransactionId(null);
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
        if (isActive) {
          setQrPayload(null);
          setTransactionId(null);
          setStatus('error');
          setErrorMessage(PRESENTATION_TIMEOUT_MESSAGE);
        }
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

            <div className="loan-nav-group">Kredite &amp; Darlehen</div>
            <div className="loan-nav-sub">Kreditübersicht</div>
            <div className="loan-nav-sub active">Neuen Kredit beantragen</div>

            <div style={{ height: '16px' }} />

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
        <main className="loan-content">
          <h1 className="loan-page-title">Neuen Kredit beantragen</h1>
          <p className="loan-page-sub">
            Einfach, schnell und sicher – in nur wenigen Schritten zu Ihrem Kredit.
          </p>

          {/* Stepper */}
          <div className="loan-stepper">
            <div className="loan-step">
              <div className="loan-step-circle done">1</div>
              <div className="loan-step-label">Kreditdetails</div>
            </div>
            <div className="loan-step-connector done" />
            <div className="loan-step">
              <div className="loan-step-circle active">2</div>
              <div className="loan-step-label active">Identifikation &amp; Einkommensnachweis</div>
            </div>
            <div className="loan-step-connector" />
            <div className="loan-step">
              <div className="loan-step-circle inactive">3</div>
              <div className="loan-step-label">Prüfung</div>
            </div>
            <div className="loan-step-connector" />
            <div className="loan-step">
              <div className="loan-step-circle inactive">4</div>
              <div className="loan-step-label">Zusammenfassung</div>
            </div>
          </div>

          {/* Overview bar */}
          <div className="loan-overview">
            <div className="loan-overview-item">
              <div className="loan-overview-label">Gewünschter Kreditbetrag</div>
              <div className="loan-overview-value">10.000 €</div>
            </div>
            <div className="loan-overview-item">
              <div className="loan-overview-label">Kreditart</div>
              <div className="loan-overview-value">Ratenkredit</div>
            </div>
            <div className="loan-overview-item">
              <div className="loan-overview-label">Laufzeit</div>
              <div className="loan-overview-value">48 Monate</div>
            </div>
          </div>

          {/* Split layout */}
          <div className="loan-split">
            {/* Main presentation card */}
            <div className="loan-main-card">
              {status === 'success' ? (
                <div className="loan-success-box">
                  <div className="loan-success-check">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <div className="loan-success-greet">Hallo {userName},</div>
                  <div className="loan-success-desc">
                    Deine Gehaltsabrechnung ist{' '}
                    <span style={{ color: '#a3e635', fontWeight: 600 }}>korrekt</span>, dein Kredit
                    wurde genehmigt.
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="loan-card-title">
                    Aktuellen Gehaltsnachweis über Ihre EUDI-Wallet bereitstellen
                  </h2>
                  <p className="loan-card-sub">
                    Bitte stellen Sie uns Ihren aktuellen Gehaltsnachweis (z. B. Lohnabrechnung)
                    sicher und digital über Ihre EUDI-Wallet bereit.
                  </p>
                  <div className="loan-secure-notice">
                    <Lock size={14} />
                    Ihre Daten werden verschlüsselt übertragen und ausschließlich für die
                    Kreditprüfung verwendet.
                  </div>

                  <div className="loan-qr-section">
                    {/* Steps */}
                    <div className="loan-instructions">
                      <div className="loan-instr-item">
                        <div className="loan-instr-icon">
                          <Smartphone size={18} />
                        </div>
                        <div>
                          <div className="loan-instr-title">EUDI-Wallet öffnen</div>
                          <div className="loan-instr-text">
                            Öffnen Sie Ihre EUDI-Wallet auf Ihrem Smartphone.
                          </div>
                        </div>
                      </div>
                      <div className="loan-instr-item">
                        <div className="loan-instr-icon">
                          <QrCode size={18} />
                        </div>
                        <div>
                          <div className="loan-instr-title">QR-Code scannen</div>
                          <div className="loan-instr-text">
                            Scannen Sie den QR-Code, um die Übergabe zu starten.
                          </div>
                        </div>
                      </div>
                      <div className="loan-instr-item">
                        <div className="loan-instr-icon">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="loan-instr-title">Gehaltsnachweis übertragen</div>
                          <div className="loan-instr-text">
                            Wählen Sie Ihren aktuellen Gehaltsnachweis aus und bestätigen Sie die
                            Übertragung.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR code box */}
                    <div className="loan-qr-box">
                      <div className="loan-qr-label">QR-Code mit Ihrer EUDI-Wallet scannen</div>
                      <div className="loan-qr-container">
                        {status === 'loading' || status === 'requesting' ? (
                          <div className="loan-spinner">Wird geladen…</div>
                        ) : status === 'error' ? (
                          <div className="loan-error-msg">{errorMessage}</div>
                        ) : qrPayload ? (
                          <QRCode
                            value={qrPayload}
                            size={256}
                            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                            viewBox="0 0 256 256"
                          />
                        ) : null}
                      </div>
                      {status === 'pending' && (
                        <div className="loan-qr-footer">
                          <Clock size={16} /> Gültig für 5:00 Minuten
                        </div>
                      )}
                      {status === 'error' && (
                        <button className="loan-refresh-link" onClick={startPresentation}>
                          <RefreshCw size={13} /> Code aktualisieren
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="loan-card-footer">
                    <span className="loan-footer-hint">
                      Probleme beim Scannen?{' '}
                      <a onClick={startPresentation}>
                        Code aktualisieren <RefreshCw size={13} />
                      </a>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Summary card */}
            <div className="loan-side-card">
              <div className="loan-sum-title">Ihr Kreditantrag</div>
              {[
                { label: 'Betrag', value: '10.000 €' },
                { label: 'Kreditart', value: 'Ratenkredit' },
                { label: 'Laufzeit', value: '48 Monate' },
                { label: 'Verwendungszweck', value: 'Freie Verwendung' },
              ].map(({ label, value }) => (
                <div key={label} className="loan-sum-row">
                  <div className="loan-sum-label">{label}</div>
                  <div className="loan-sum-value">{value}</div>
                </div>
              ))}
              <div className="loan-trust-box">
                <div className="loan-trust-title">
                  <Lock size={14} /> Sicher &amp; geschützt
                </div>
                <div className="loan-trust-text">
                  Ihre Daten werden verschlüsselt übertragen und gemäß höchsten Sicherheitsstandards
                  verarbeitet.
                </div>
              </div>
            </div>
          </div>

          {/* Bottom action buttons */}
          <div className="loan-actions">
            <button className="loan-btn-cancel" onClick={() => navigate('/')}>
              Abbrechen
            </button>
            <button
              className={`loan-btn-next ${status === 'success' ? 'active' : ''}`}
              disabled={status !== 'success'}
              onClick={() => {
                if (status === 'success') {
                  navigate('/');
                }
              }}
            >
              Weiter &rsaquo;
            </button>
          </div>
        </main>
      </div>

      {/* ── Experimental playground banner ── */}
      <div className="loan-banner">
        <div className="loan-banner-icon">i</div>
        <div className="loan-banner-text">
          This is an experimental playground.
          <br />
          Made solely for demo purposes.
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
