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

const PRESENTATION_POLL_INTERVAL_MS = 2000;
const PRESENTATION_REQUEST_TIMEOUT_MS = 5 * 60 * 1000;
const PRESENTATION_TIMEOUT_MESSAGE =
  'Der QR-Code ist abgelaufen. Bitte aktualisieren Sie den Code und versuchen Sie es erneut.';

/* ─────────────────────────── component ─────────────────────────── */
const LoanApplication = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'requesting' | 'pending' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const userName =
    userProfile?.firstName && userProfile?.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : userProfile?.username || 'Max Mustermann';

  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

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
    startPresentation();
  }, []);

  useEffect(() => {
    if (status !== 'pending' || !transactionId) return;
    let isActive = true;
    let isPolling = false;
    const startedAt = Date.now();

    const interval = setInterval(async () => {
      if (Date.now() - startedAt >= PRESENTATION_REQUEST_TIMEOUT_MS) {
        if (isActive) {
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Segoe UI', sans-serif; }

        .loan-page { display: flex; flex-direction: column; min-height: 100vh; background: #f5f7fa; color: #1e293b; font-family: 'Inter', 'Segoe UI', sans-serif; }

        /* Header */
        .loan-header { display: flex; justify-content: space-between; align-items: center; padding: 0 32px; height: 64px; background: #fff; border-bottom: 1px solid #e2e8f0; }
        .loan-logo { display: flex; align-items: center; gap: 10px; }
        .loan-logo-icon { color: #1e3a8a; }
        .loan-logo-name { font-size: 20px; font-weight: 700; color: #1e293b; }
        .loan-logo-tag { font-size: 11px; color: #64748b; margin-top: 1px; }
        .loan-header-right { display: flex; align-items: center; gap: 24px; }
        .loan-header-link { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; cursor: pointer; }
        .loan-header-link:hover { color: #1e3a8a; }
        .loan-avatar { width: 34px; height: 34px; border-radius: 50%; background: #1e3a8a; color: #fff; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; }
        .loan-username { font-size: 13px; font-weight: 500; color: #1e293b; display: flex; align-items: center; gap: 4px; }

        /* Layout */
        .loan-body { display: flex; flex: 1; }

        /* Sidebar */
        .loan-sidebar { width: 240px; min-width: 240px; background: #fff; border-right: 1px solid #e2e8f0; padding: 16px 0; display: flex; flex-direction: column; justify-content: space-between; }
        .loan-nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 20px; font-size: 14px; color: #475569; cursor: pointer; }
        .loan-nav-item:hover { background: #f1f5f9; color: #1e293b; }
        .loan-nav-group { font-size: 13px; font-weight: 600; color: #1e293b; padding: 16px 20px 6px; }
        .loan-nav-sub { padding: 8px 20px 8px 48px; font-size: 14px; color: #475569; cursor: pointer; }
        .loan-nav-sub:hover { background: #f1f5f9; }
        .loan-nav-sub.active { color: #1e3a8a; font-weight: 500; display: flex; align-items: center; gap: 8px; }
        .loan-nav-sub.active::before { content: '•'; font-size: 16px; color: #1e3a8a; }
        .loan-sidebar-footer { padding: 16px 20px; border-top: 1px solid #e2e8f0; }
        .loan-contact-btn { display: flex; align-items: center; gap: 8px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 16px; font-size: 13px; color: #475569; cursor: pointer; background: #fff; width: 100%; }
        .loan-contact-btn:hover { background: #f1f5f9; }
        .loan-sidebar-help { font-size: 12px; color: #64748b; margin-bottom: 8px; }

        /* Content */
        .loan-content { flex: 1; padding: 24px 20px 80px; overflow-y: auto; }
        .loan-page-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .loan-page-sub { font-size: 14px; color: #64748b; margin-bottom: 16px; }

        /* Stepper */
        .loan-stepper { display: flex; align-items: flex-start; gap: 0; margin-bottom: 20px; }
        .loan-step { display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; flex: 1; }
        .loan-step-circle { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; z-index: 1; }
        .loan-step-circle.done { background: #1e3a8a; color: #fff; }
        .loan-step-circle.active { background: #1e3a8a; color: #fff; }
        .loan-step-circle.inactive { background: #fff; color: #94a3b8; border: 2px solid #cbd5e1; }
        .loan-step-label { font-size: 12px; color: #94a3b8; text-align: center; white-space: nowrap; }
        .loan-step-label.active { color: #1e3a8a; font-weight: 600; }
        .loan-step-connector { flex: 1; height: 2px; background: #e2e8f0; margin-top: 15px; }
        .loan-step-connector.done { background: #1e3a8a; }

        /* Overview bar */
        .loan-overview { display: flex; gap: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .loan-overview-item { padding: 16px 28px; border-right: 1px solid #e2e8f0; }
        .loan-overview-item:last-child { border-right: none; }
        .loan-overview-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
        .loan-overview-value { font-size: 20px; font-weight: 700; color: #1e293b; }

        /* Split layout */
        .loan-split { display: flex; gap: 20px; align-items: flex-start; }
        .loan-main-card { flex: 1; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 28px; }
        .loan-side-card { width: 260px; min-width: 260px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }

        /* Presentation card internals */
        .loan-card-title { font-size: 16px; font-weight: 600; color: #1e3a8a; margin-bottom: 8px; }
        .loan-card-sub { font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 16px; }
        .loan-secure-notice { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; background: #f8fafc; border-radius: 4px; padding: 10px 14px; margin-bottom: 24px; }

        .loan-qr-section { display: flex; gap: 28px; }
        .loan-instructions { flex: 1; display: flex; flex-direction: column; gap: 20px; }
        .loan-instr-item { display: flex; gap: 14px; align-items: flex-start; }
        .loan-instr-icon { width: 32px; height: 32px; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #475569; flex-shrink: 0; }
        .loan-instr-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 3px; }
        .loan-instr-text { font-size: 12px; color: #64748b; line-height: 1.4; }

        .loan-qr-box { width: 210px; min-width: 210px; display: flex; flex-direction: column; align-items: center; }
        .loan-qr-label { font-size: 12px; font-weight: 600; color: #1e3a8a; text-align: center; margin-bottom: 14px; line-height: 1.4; }
        .loan-qr-container { width: 178px; height: 178px; background: #fff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .loan-qr-footer { font-size: 11px; color: #64748b; margin-top: 10px; display: flex; align-items: center; gap: 4px; }
        .loan-spinner { font-size: 13px; color: #64748b; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .loan-error-msg { font-size: 12px; color: #ef4444; text-align: center; }

        .loan-refresh-link { font-size: 12px; color: #1e3a8a; display: flex; align-items: center; gap: 4px; margin-top: 12px; cursor: pointer; }
        .loan-refresh-link:hover { text-decoration: underline; }

        .loan-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .loan-footer-hint { font-size: 13px; color: #64748b; }
        .loan-footer-hint a { color: #1e3a8a; text-decoration: none; cursor: pointer; }
        .loan-footer-hint a:hover { text-decoration: underline; }

        /* Bottom buttons */
        .loan-actions { display: flex; justify-content: space-between; margin-top: 20px; }
        .loan-btn-cancel { padding: 10px 24px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; font-size: 14px; color: #475569; cursor: pointer; }
        .loan-btn-cancel:hover { background: #f1f5f9; }
        .loan-btn-next { padding: 10px 28px; background: #cbd5e1; border: none; border-radius: 6px; font-size: 14px; color: #fff; cursor: not-allowed; display: flex; align-items: center; gap: 6px; }

        /* Summary card */
        .loan-sum-title { font-size: 14px; font-weight: 600; color: #1e3a8a; margin-bottom: 16px; }
        .loan-sum-row { margin-bottom: 14px; }
        .loan-sum-label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
        .loan-sum-value { font-size: 15px; font-weight: 600; color: #1e293b; }
        .loan-trust-box { margin-top: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; }
        .loan-trust-title { font-size: 13px; font-weight: 600; color: #1e3a8a; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
        .loan-trust-text { font-size: 12px; color: #64748b; line-height: 1.5; }

        /* Experimental banner */
        .loan-banner { position: fixed; bottom: 12px; right: 20px; z-index: 9999; background: #1F3D52; color: #d1d5db; display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .loan-banner-icon { width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; font-style: italic; font-weight: 600; font-size: 14px; color: #e5e7eb; flex-shrink: 0; }
        .loan-banner-text { font-size: 13px; font-weight: 700; line-height: 1.3; color: #e5e7eb; }

        /* Success box inside main card */
        .loan-success-box {
          background-color: #09090b;
          border-radius: 8px;
          padding: 48px;
          color: #fff;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 280px;
          justify-content: center;
        }
        .loan-success-check {
          width: 28px;
          height: 28px;
          background-color: #22c55e;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-bottom: 24px;
        }
        .loan-success-greet {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 20px;
          font-family: 'Inter', sans-serif;
        }
        .loan-success-desc {
          font-size: 18px;
          font-weight: 500;
          line-height: 1.5;
          color: #e4e4e7;
          font-family: 'Inter', sans-serif;
        }
        .loan-btn-next.active {
          background: #1e3a8a;
          color: #fff;
          cursor: pointer;
        }
        .loan-btn-next.active:hover {
          background: #1d4ed8;
        }

        .loan-logout-btn {
          margin-left: 8px;
          background: none;
          border: 1px solid #cbd5e1;
          color: #475569;
          border-radius: 4px;
          padding: 4px 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .loan-logout-btn:hover {
          background-color: #f1f5f9;
        }

        /* Desktop layout (No-scroll, single-page fit) */
        @media (min-width: 901px) {
          .loan-page { height: 100vh; min-height: 100vh; overflow: hidden; }
          .loan-body { height: calc(100vh - 64px); overflow: hidden; }
          .loan-content { height: 100%; overflow: hidden; padding: 24px 40px; display: flex; flex-direction: column; }
          .loan-split { flex: 1; min-height: 0; display: flex; gap: 20px; }
          .loan-main-card, .loan-side-card { height: 100%; display: flex; flex-direction: column; }
          .loan-qr-section { flex: 1; min-height: 0; align-items: center; }
          .loan-card-footer { margin-top: auto; }
          .loan-trust-box { margin-top: auto; }
        }

        /* Mobile responsiveness */
        @media (max-width: 1024px) {
          .loan-side-card { width: 220px; min-width: 220px; }
        }
        @media (max-width: 900px) {
          .loan-sidebar { display: none; }
          .loan-content { padding: 24px 20px 80px; }
          .loan-split { flex-direction: column; }
          .loan-side-card { width: 100%; min-width: unset; }
        }
        @media (max-width: 640px) {
          .loan-header { padding: 0 16px; }
          .loan-header-link { display: none; }
          .loan-username { display: none; }
          .loan-qr-section { flex-direction: column; }
          .loan-qr-box { width: 100%; }
          .loan-overview { flex-direction: column; }
          .loan-overview-item { border-right: none; border-bottom: 1px solid #e2e8f0; }
          .loan-overview-item:last-child { border-bottom: none; }
          .loan-stepper { overflow-x: auto; }
        }
      `}</style>

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
              <button className="loan-logout-btn" onClick={logout}>
                Abmelden
              </button>
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
                <div className="loan-step-label active">
                  Identifikation &amp; Einkommensnachweis
                </div>
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
                      <span style={{ color: '#a3e635', fontWeight: 600 }}>korrekt</span>, dein
                      Kredit wurde genehmigt.
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
                        <div className="loan-qr-label">
                          QR-Code mit Ihrer
                          <br />
                          EUDI-Wallet scannen
                        </div>
                        <div className="loan-qr-container">
                          {status === 'loading' || status === 'requesting' ? (
                            <div className="loan-spinner">Wird geladen…</div>
                          ) : status === 'error' ? (
                            <div className="loan-error-msg">{errorMessage}</div>
                          ) : qrPayload ? (
                            <QRCode
                              value={qrPayload}
                              size={158}
                              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                              viewBox="0 0 158 158"
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
                    Ihre Daten werden verschlüsselt übertragen und gemäß höchsten
                    Sicherheitsstandards verarbeitet.
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
    </>
  );
};

export default LoanApplication;
