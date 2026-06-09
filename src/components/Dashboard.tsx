import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import oid4vcService from '../services/oid4vc.service';
import QRCode from 'react-qr-code';
import {
  User,
  Wallet,
  Building2,
  Banknote,
  CalendarDays,
  CircleDollarSign,
  Clock,
  CalendarCheck,
  FileText,
  ShieldCheck,
  Landmark,
  Home,
  Building,
  Briefcase,
  ArrowLeft,
  Check,
  Shield,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Static payslip data – mirrors the values in client-scope-PayslipCredential.json
// ---------------------------------------------------------------------------
const PAYSLIP = {
  payrollPeriod: 'April 2026',
  employer: 'Beispiel GmbH',
  issueDate: '21.05.2026',
  documentId: 'PAY-2026-04-12345',
  grossSalary: '5.000,00',
  netSalary: '3.200,00',
  currency: 'EUR',
  paymentDate: '30.04.2026',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoading: isAuthLoading } = useAuth();

  const [offerDeeplink, setOfferDeeplink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fullName = 'Max Mustermann';
  const initials = 'MM';

  const loadOffer = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use by reference (true) instead of by value (false) to make QR code easier to scan
      const link = await oid4vcService.getCredentialOfferDeeplink(true);
      setOfferDeeplink(link);
    } catch (err) {
      console.error('Credential offer failed', err);
      setError('Fehler beim Laden des Credential-Angebots. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to finish before loading the credential offer
    if (!isAuthLoading) {
      loadOffer();
    }
  }, [isAuthLoading, loadOffer]);

  // ---------------------------------------------------------------------------
  // Tab nav items
  // ---------------------------------------------------------------------------
  const tabs = [
    { key: 'uebersicht', label: 'Übersicht', active: false },
    { key: 'gehaltsnachweise', label: 'Gehaltsnachweise', active: true },
    { key: 'verlauf', label: 'Verlauf', active: false },
  ];

  // ---------------------------------------------------------------------------
  // Use-case tiles shown at the bottom
  // ---------------------------------------------------------------------------
  const useCases = [
    {
      icon: <Landmark size={28} strokeWidth={1.5} />,
      title: 'Kredit & Finanzierung',
      sub: 'Bei Banken und Finanzinstituten',
    },
    {
      icon: <Home size={28} strokeWidth={1.5} />,
      title: 'Mietvertrag',
      sub: 'Als Einkommensnachweis für Vermieter',
    },
    {
      icon: <Building size={28} strokeWidth={1.5} />,
      title: 'Behörden & Ämter',
      sub: 'Für Anträge und Verwaltungsprozesse',
    },
    {
      icon: <Briefcase size={28} strokeWidth={1.5} />,
      title: 'Weitere Services',
      sub: 'Überall dort, wo ein Gehaltsnachweis benötigt wird',
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className="dashboard-container"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f7fa',
        fontFamily: 'Arial, sans-serif',
        color: '#111827',
        overflow: 'hidden',
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header
        className="dashboard-header"
        style={{
          backgroundColor: '#fff',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}
      >
        {/* Logo + app name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={`${import.meta.env.BASE_URL}datev.png`}
            alt="DATEV"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
          <span
            style={{ color: '#111827', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.01em' }}
          >
            Mein Gehaltsnachweis
          </span>
        </div>

        {/* Tab navigation (read-only – tabs are decorative only) */}
        <nav className="header-nav" style={{ display: 'flex', height: '56px' }}>
          {tabs.map((t) => (
            <span
              key={t.key}
              className="header-nav-tab"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                height: '100%',
                color: t.active ? '#111827' : '#6b7280',
                fontWeight: t.active ? 600 : 400,
                fontSize: '0.9rem',
                borderBottom: t.active ? '3px solid #9ece50' : '3px solid transparent',
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              {t.label}
            </span>
          ))}
        </nav>

        {/* User avatar + name (no logout needed — demo mode) */}
        <div
          className="user-section"
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <span
            className="user-name"
            style={{ color: '#111827', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            {fullName}
          </span>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Page content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main
        className="dashboard-main"
        style={{
          flex: 1,
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#039A9A',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '8px',
            padding: 0,
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Zurück zur Übersicht
        </button>

        {/* Title row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '4px',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>
            Gehaltsnachweis – {PAYSLIP.payrollPeriod}
          </h1>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 10px',
              backgroundColor: '#f5faee',
              border: '1px solid #e3f0ce',
              borderRadius: '999px',
              color: '#4a701b',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <Check size={14} /> Verifiziert
          </span>
        </div>
        <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '0.85rem' }}>
          Dieser Gehaltsnachweis wurde von {PAYSLIP.employer} ausgestellt und ist digital
          verifiziert.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* Two-column body                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="content-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '16px',
            alignItems: 'stretch',
          }}
        >
          {/* ------------------------------------------------------------ */}
          {/* LEFT COLUMN: Gehaltsdetails + Wofür tiles                    */}
          {/* ------------------------------------------------------------ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Payslip details card */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FileText size={18} color="#4b5563" />
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Gehaltsdetails</h2>
              </div>
              <div
                style={{
                  padding: '20px 24px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  className="details-grid"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}
                >
                  <DetailField icon={<User size={16} />} label="Arbeitnehmer" value={fullName} />
                  <DetailField
                    icon={<Wallet size={16} />}
                    label="Bruttogehalt"
                    value={`${PAYSLIP.grossSalary} EUR`}
                  />
                  <DetailField
                    icon={<Building2 size={16} />}
                    label="Arbeitgeber"
                    value={PAYSLIP.employer}
                  />
                  <DetailField
                    icon={<Banknote size={16} />}
                    label="Nettogehalt"
                    value={`${PAYSLIP.netSalary} EUR`}
                    valueColor="#4a701b"
                  />
                  <DetailField
                    icon={<CalendarDays size={16} />}
                    label="Abrechnungszeitraum"
                    value={PAYSLIP.payrollPeriod}
                  />
                  <DetailField
                    icon={<CircleDollarSign size={16} />}
                    label="Währung"
                    value={PAYSLIP.currency}
                  />
                  <DetailField
                    icon={<Clock size={16} />}
                    label="Ausstellungsdatum"
                    value={PAYSLIP.issueDate}
                  />
                  <DetailField
                    icon={<CalendarCheck size={16} />}
                    label="Auszahlungsdatum"
                    value={PAYSLIP.paymentDate}
                  />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <DetailField
                      icon={<FileText size={16} />}
                      label="Dokument-ID"
                      value={PAYSLIP.documentId}
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: '16px',
                    padding: '10px 14px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      color: '#3b82f6',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Shield size={14} /> Dieser Nachweis ist qualifiziert elektronisch signiert und
                    stammt von {PAYSLIP.employer}.
                  </span>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#3b82f6',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    Details anzeigen
                  </button>
                </div>
              </div>
            </div>

            {/* Wofür tiles */}
            <div>
              <h3 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700 }}>
                Wofür können Sie diesen Nachweis verwenden?
              </h3>
              <div
                className="use-cases-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}
              >
                {useCases.map((uc) => (
                  <div
                    key={uc.title}
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '6px',
                    }}
                  >
                    <div style={{ color: '#374151', marginBottom: '4px' }}>{uc.icon}</div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>
                      {uc.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.3 }}>
                      {uc.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT: EUDI Wallet card — stretches to match left column      */}
          {/* ------------------------------------------------------------ */}
          <div
            style={{
              backgroundColor: '#f5faee',
              borderRadius: '12px',
              border: '1px solid #e3f0ce',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '16px 16px 8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={18} color="#4a701b" />
              <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#4a701b' }}>
                In EUDI-Wallet übernehmen
              </h2>
            </div>

            <div
              style={{
                padding: '8px 16px 16px 16px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <p
                style={{
                  margin: '0 0 10px',
                  color: '#3b5914',
                  fontSize: '0.82rem',
                  lineHeight: 1.3,
                }}
              >
                Scannen Sie den QR-Code mit Ihrer EUDI-Wallet, um diesen Gehaltsnachweis sicher zu
                erhalten.
              </p>

              {/* QR code — flex:1 makes this box absorb the remaining height */}
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                {isLoading && (
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        margin: '0 auto 8px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #9ece50',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <p style={{ margin: 0, fontSize: '0.75rem' }}>QR-Code wird geladen…</p>
                  </div>
                )}
                {!isLoading && error && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px', color: '#dc2626', fontSize: '0.8rem' }}>
                      {error}
                    </p>
                    <button
                      onClick={loadOffer}
                      style={{
                        backgroundColor: '#4C7B16',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      Erneut versuchen
                    </button>
                  </div>
                )}
                {!isLoading && !error && offerDeeplink && (
                  <>
                    <div
                      className="qr-code-wrapper"
                      style={{
                        backgroundColor: '#fff',
                        padding: '6px',
                        borderRadius: '6px',
                        width: '100%',
                      }}
                    >
                      <QRCode
                        value={offerDeeplink}
                        size={256}
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                        viewBox="0 0 256 256"
                      />
                    </div>
                    <button
                      onClick={loadOffer}
                      style={{
                        marginTop: '8px',
                        background: 'none',
                        border: '1px solid #9ece50',
                        color: '#4a701b',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        transition: 'background-color 0.2s, color 0.2s',
                        width: '100%',
                        textAlign: 'center',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#9ece50';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#4a701b';
                      }}
                    >
                      Code aktualisieren
                    </button>
                  </>
                )}
              </div>

              {/* Steps */}
              <ol
                style={{
                  margin: '10px 0 0',
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                {[
                  'Öffnen Sie Ihre EUDI-Wallet App',
                  'Wählen Sie „QR-Code scannen"',
                  'Scannen Sie diesen Code',
                  'Prüfen und übernehmen Sie den Gehaltsnachweis',
                ].map((step, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '0.78rem',
                      color: '#374151',
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#4C7B16',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              {/* Trust note */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#4a701b" />
                <span style={{ color: '#4a701b', fontSize: '0.75rem', fontWeight: 600 }}>
                  Sicher. Verifiziert. In Ihrer Kontrolle.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                               */}
      {/* ------------------------------------------------------------------ */}
      <footer
        style={{
          borderTop: '1px solid #e5e7eb',
          padding: '10px 24px',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        <ShieldCheck size={14} />
        <span>
          Dieser Service wird bereitgestellt von DATEV. Rechtliche Hinweise und Datenschutz finden
          Sie in unserer{' '}
          <a href="#" style={{ color: '#039A9A', textDecoration: 'underline' }}>
            Datenschutzerklärung
          </a>
          .
        </span>
      </footer>

      {/* Keyframe for spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .dashboard-container {
            height: auto !important;
            min-height: 100vh;
            overflow: auto !important;
          }
          .dashboard-header {
            padding: 8px 16px !important;
            height: auto !important;
            flex-wrap: wrap;
            gap: 12px;
          }
          .header-nav {
            order: 3;
            width: 100%;
            justify-content: center;
            height: auto !important;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            margin-top: 4px;
          }
          .header-nav-tab {
            padding: 8px 12px !important;
            font-size: 0.8rem !important;
            border-bottom-width: 2px !important;
          }
          .user-section {
            gap: 8px !important;
          }
          .user-name {
            display: none !important;
          }
          .dashboard-main {
            padding: 12px 12px !important;
          }
          .content-grid {
            grid-template-columns: 1fr !important;
          }
          .details-grid {
            grid-template-columns: 1fr !important;
            gap: 12px 16px !important;
          }
          .use-cases-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .qr-code-wrapper {
            max-width: 240px !important;
            margin: 0 auto !important;
          }
          .playground-notice {
            position: static !important;
            margin: 16px auto 0 !important;
            width: 100% !important;
            max-width: 320px !important;
            box-shadow: none !important;
          }
        }

        @media (max-width: 480px) {
          .use-cases-grid {
            grid-template-columns: 1fr !important;
          }
          .title-row h1 {
            font-size: 1.3rem !important;
          }
        }
      `}</style>

      {/* Experimental Playground Notice */}
      <div
        className="playground-notice"
        style={{
          position: 'fixed',
          bottom: '12px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#d1d5db',
          fontSize: '13px',
          opacity: 0.9,
          zIndex: 9999,
          backgroundColor: '#1F3D52',
          padding: '10px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
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
        <div
          style={{
            fontWeight: 700,
            lineHeight: '1.3',
            color: '#e5e7eb',
          }}
        >
          <div>This is an experimental playground.</div>
          <div>Made solely for demo purposes.</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Helper: single labelled detail field
// ---------------------------------------------------------------------------
function DetailField({
  icon,
  label,
  value,
  valueColor = '#111827',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#6b7280',
          fontSize: '0.75rem',
          marginBottom: '2px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>{icon}</span>
        {label}
      </div>
      <div style={{ fontWeight: 600, color: valueColor, fontSize: '0.88rem' }}>{value}</div>
    </div>
  );
}

export default Dashboard;
