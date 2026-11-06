// ============================================================================
// iQuire — Member: Certificates (Phase 17.7 - Premium Design)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchMyCertificates,
  formatSessionDate,
  type MyCertificate,
} from '../../services/student.service';
import styles from './Certificates.module.css';

// Load logo via Vite import
import iQuireLogo from '../../assets/logo/iquire-logo.png';

// ============================================================================
// Component
// ============================================================================

export const MemberCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<MyCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<MyCertificate | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const res = await fetchMyCertificates();
      if (!isMounted) return;

      if (!res.success) {
        setError(res.error ?? 'Failed to load certificates');
      } else {
        setCertificates(res.data ?? []);
      }
      setIsLoading(false);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Certificates</h1>
        </div>
        <div className={styles.grid}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Certificates</h1>
          <p className={styles.pageSubtitle}>
            View and download your earned certificates.
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button
            type="button"
            className={styles.errorClose}
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏆</div>
          <h3 className={styles.emptyTitle}>No certificates yet</h3>
          <p className={styles.emptyText}>
            Complete a course to earn your first certificate. Once you finish,
            your certificate will appear here.
          </p>
          <Link to="/dashboard/courses" className={styles.emptyCta}>
            View My Courses →
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.statsRow}>
            <div className={styles.statPill}>
              <span className={styles.statValue}>{certificates.length}</span>
              <span className={styles.statLabel}>Total Earned</span>
            </div>
          </div>

          <div className={styles.grid}>
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.enrollment_id}
                certificate={cert}
                onView={() => setSelectedCert(cert)}
              />
            ))}
          </div>
        </>
      )}

      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
          logo={iQuireLogo}
        />
      )}
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface CertificateCardProps {
  certificate: MyCertificate;
  onView: () => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onView,
}) => {
  return (
    <article className={styles.card}>
      <div className={styles.cardRibbon}>
        <span className={styles.ribbonIcon}>🏆</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.certHeader}>
          <span className={styles.certLabel}>Certificate of Completion</span>
          <span className={styles.certNumber}>{certificate.certificate_number}</span>
        </div>

        <h3 className={styles.certCourseTitle}>{certificate.course_title}</h3>

        {certificate.cohort_name && (
          <p className={styles.certCohort}>{certificate.cohort_name}</p>
        )}

        <div className={styles.certMeta}>
          <div className={styles.certMetaItem}>
            <span className={styles.certMetaLabel}>Awarded to</span>
            <span className={styles.certMetaValue}>{certificate.student_name}</span>
          </div>
          <div className={styles.certMetaItem}>
            <span className={styles.certMetaLabel}>Completed</span>
            <span className={styles.certMetaValue}>
              {formatSessionDate(certificate.completed_at)}
            </span>
          </div>
        </div>

        <div className={styles.certActions}>
          <button onClick={onView} className={styles.viewBtn}>
            View Certificate →
          </button>
          <button
            onClick={() => window.print()}
            className={styles.printBtn}
            title="Print or save as PDF"
          >
            🖨 Print
          </button>
        </div>
      </div>
    </article>
  );
};

// ----------------------------------------------------------------------------

interface CertificateModalProps {
  certificate: MyCertificate;
  onClose: () => void;
  logo: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
  logo,
}) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>

        {/* Premium Printable Certificate */}
        <div className={styles.certificatePrint}>
          <div className={styles.certBorderOuter}>
            <div className={styles.certBorderInner}>
              
              {/* Watermark Logo */}
              <img src={logo} alt="iQuire" className={styles.certWatermark} />

              {/* Corner Accents */}
              <div className={styles.certCornerTopLeft} />
              <div className={styles.certCornerBottomRight} />

              <div className={styles.certContent}>
                {/* Header Logo */}
                <img src={logo} alt="iQuire Logo" className={styles.certLogo} />

                <h1 className={styles.certMainTitle}>Certificate</h1>
                <p className={styles.certSubtitle}>of Completion</p>

                <div className={styles.certDivider}>
                  <span className={styles.certDividerLine} />
                  <span className={styles.certDividerDot} />
                  <span className={styles.certDividerLine} />
                </div>

                <p className={styles.certAwardedTo}>This certificate is proudly presented to</p>
                <h2 className={styles.certStudentName}>{certificate.student_name}</h2>

                <p className={styles.certAwardedTo}>for successfully completing the programme</p>
                <h3 className={styles.certCourseName}>{certificate.course_title}</h3>

                {certificate.cohort_name && (
                  <p className={styles.certCohortName}>{certificate.cohort_name}</p>
                )}

                <div className={styles.certSignatures}>
                  <div className={styles.certSignatureBlock}>
                    <span className={styles.certSignatureLine} />
                    <span className={styles.certSignatureLabel}>Programme Director</span>
                  </div>
                  
                  <div className={styles.certSeal}>
                    <div className={styles.certSealInner}>
                      <span className={styles.certSealIcon}>🏆</span>
                      <span className={styles.certSealText}>Official</span>
                    </div>
                  </div>
                  
                  <div className={styles.certSignatureBlock}>
                    <span className={styles.certSignatureLine} />
                    <span className={styles.certSignatureLabel}>Date of Completion</span>
                    <span className={styles.certSignatureDate}>
                      {formatSessionDate(certificate.completed_at)}
                    </span>
                  </div>
                </div>

                <div className={styles.certFooter}>
                  <span className={styles.certFooterLabel}>Certificate No.</span>
                  <span className={styles.certFooterValue}>{certificate.certificate_number}</span>
                  <span className={styles.certFooterDivider}>|</span>
                  <span className={styles.certFooterLabel}>Verify at</span>
                  <span className={styles.certFooterValue}>iQuire.africa/verify</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button onClick={() => window.print()} className={styles.downloadBtn}>
            🖨 Download / Print
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};