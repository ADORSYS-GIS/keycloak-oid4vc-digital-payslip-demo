import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import oid4vcService from '../services/oid4vc.service';
import QRCode from 'react-qr-code';
import {
  User,
  Wallet,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock,
  CalendarCheck,
  FileText,
  Landmark,
  ArrowLeft,
  Check,
  Lock,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Static payslip data – mirrors the values in client-scope-PayslipCredential.json
// ---------------------------------------------------------------------------
const PAYSLIP = {
  payrollPeriod: 'April 2026',
  employer: 'Beispiel GmbH',
  issueDate: '30.04.2026',
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
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const fullName = 'Max Mustermann';
  const initials = 'MM';

  const loadOffer = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use by value (false) instead of by reference (true) to embed the full credential offer in the link
      const link = await oid4vcService.getCredentialOfferDeeplink(false);
      setOfferDeeplink(link);
    } catch (err) {
      console.error('Credential offer failed', err);
      setError('Fehler beim Laden des Credential-Angebots. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Mein Gehaltsnachweis';
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = `${import.meta.env.BASE_URL}datev.png`;
    }
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
                borderBottom: t.active ? '3px solid #15803d' : '3px solid transparent',
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
        <h1 style={{ margin: '0 0 4px', fontSize: '2.2rem', fontWeight: 700, color: '#111827' }}>
          Digitaler Gehaltsnachweis
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          <span>{PAYSLIP.payrollPeriod}</span>
          <span>•</span>
          <span
            style={{
              color: '#15803d',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={14} /> Verifiziert von DATEV
          </span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Two-column body                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="content-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* ------------------------------------------------------------ */}
          {/* LEFT COLUMN: Gehaltsdetails + Verwendung                     */}
          {/* ------------------------------------------------------------ */}
          {/* ------------------------------------------------------------ */}
          {/* LEFT: Gehaltsdetails                                         */}
          {/* ------------------------------------------------------------ */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '50%',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                  Gehaltsdetails
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  Die wichtigsten Informationen auf einen Blick.
                </p>
              </div>
            </div>

            {/* Body */}
            <div
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Worker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '50%',
                      color: '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Arbeitnehmer</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                      {fullName}
                    </div>
                  </div>
                </div>

                {/* Employer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '50%',
                      color: '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Arbeitgeber</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                      {PAYSLIP.employer}
                    </div>
                  </div>
                </div>

                {/* Payroll Period */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '50%',
                      color: '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Abrechnungszeitraum</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                      {PAYSLIP.payrollPeriod}
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal line */}
              <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '20px 0' }} />

              {/* Salaries Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                    Bruttogehalt
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#111827',
                      marginTop: '4px',
                    }}
                  >
                    {PAYSLIP.grossSalary} EUR
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                    Nettogehalt
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#15803d',
                      marginTop: '4px',
                    }}
                  >
                    {PAYSLIP.netSalary} EUR
                  </div>
                </div>
              </div>

              {/* Badges Row */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    color: '#15803d',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  <Check size={14} /> Verifiziert
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    color: '#15803d',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  <Lock size={14} /> Digital signiert
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    color: '#15803d',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  <Wallet size={14} /> Wallet-kompatibel
                </div>
              </div>

              {/* Accordion area */}
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '16px',
                  textAlign: 'center',
                }}
              >
                <button
                  onClick={() => setShowMoreDetails(!showMoreDetails)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {showMoreDetails ? 'Details ausblenden' : 'Weitere Details anzeigen'}
                  <span
                    style={{
                      transform: showMoreDetails ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      display: 'inline-flex',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </button>

                {showMoreDetails && (
                  <div
                    style={{
                      marginTop: '16px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px 16px',
                      textAlign: 'left',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <DetailField
                      icon={<CircleDollarSign size={14} />}
                      label="Währung"
                      value={PAYSLIP.currency}
                    />
                    <DetailField
                      icon={<Clock size={14} />}
                      label="Ausstellungsdatum"
                      value={PAYSLIP.issueDate}
                    />
                    <DetailField
                      icon={<CalendarCheck size={14} />}
                      label="Auszahlungsdatum"
                      value={PAYSLIP.paymentDate}
                    />
                    <DetailField
                      icon={<FileText size={14} />}
                      label="Dokument-ID"
                      value={PAYSLIP.documentId}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT: EUDI Wallet card — stretches to match left column      */}
          {/* ------------------------------------------------------------ */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
              padding: '24px',
            }}
          >
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '50%',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <Wallet size={20} />
              </div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#15803d' }}>
                In EUDI-Wallet übernehmen
              </h2>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  maxWidth: '300px',
                  marginTop: '6px',
                  lineHeight: 1.4,
                }}
              >
                Scannen Sie den QR-Code mit Ihrer EUDI-Wallet, um diesen Gehaltsnachweis sicher zu
                übernehmen.
              </p>
            </div>

            {/* QR Code section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                margin: '12px 0 24px',
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
                      borderTop: '3px solid #15803d',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <p style={{ margin: 0, fontSize: '13px' }}>QR-Code wird geladen…</p>
                </div>
              )}
              {!isLoading && error && (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <p
                    style={{
                      margin: '0 0 12px',
                      color: '#dc2626',
                      fontSize: '13px',
                      lineHeight: 1.4,
                    }}
                  >
                    {error}
                  </p>
                  <button
                    onClick={loadOffer}
                    style={{
                      backgroundColor: '#15803d',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
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
                      padding: '4px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <QRCode
                      value={offerDeeplink}
                      size={180}
                      style={{ height: 'auto', maxWidth: '100%', width: '100%', display: 'block' }}
                      viewBox="0 0 256 256"
                    />
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Clock size={14} /> Gültig für 5:00 Minuten
                  </div>
                </>
              )}
            </div>

            {/* Bottom notice */}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '16px' }} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '0 4px',
                }}
              >
                <Lock size={16} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span
                  style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.4, textAlign: 'left' }}
                >
                  Ihre Daten werden ausschließlich verschlüsselt übertragen und gemäß höchsten
                  Sicherheitsstandards verarbeitet.
                </span>
              </div>
            </div>
          </div>
          {/* end content-grid */}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Verwendung — full width below both columns                       */}
        {/* ---------------------------------------------------------------- */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>
            Verwendung in diesem Demo-Szenario
          </h3>

          <div
            onClick={() => navigate('/kreditantrag')}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f0fdf4',
                borderRadius: '50%',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Landmark size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E3A8A' }}>
                Kreditantrag bei SecureBank
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                Übermittlung Ihres Gehaltsnachweises für die Kreditprüfung.
              </div>
            </div>
          </div>
        </div>
      </main>

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
