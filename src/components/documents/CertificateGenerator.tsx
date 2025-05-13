import React from 'react';
import QRCode from 'react-qr-code';

interface CertificateProps {
  signerName: string;
  signedAt: string;
  vaultRecordId: string;
  verificationUrl: string;
}

/**
 * Certificate component that generates a verification certificate
 * This is used for both rendering in the UI and for PDF generation
 */
const CertificateGenerator: React.FC<CertificateProps> = ({
  signerName,
  signedAt,
  vaultRecordId,
  verificationUrl,
}) => {
  return (
    <div className="certificate-container" style={{
      fontFamily: 'serif',
      padding: '20px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#ffffff',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <div className="certificate-header" style={{
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1a202c',
          marginBottom: '8px',
        }}>Certificate of Vault</h2>
        <p style={{
          fontSize: '14px',
          color: '#4a5568',
        }}>This document has been securely vaulted with SignVault</p>
      </div>

      <div className="certificate-content" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div className="certificate-field" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#4a5568',
          }}>Signer Name:</label>
          <div style={{
            fontSize: '16px',
            color: '#1a202c',
            padding: '8px',
            backgroundColor: '#f7fafc',
            borderRadius: '4px',
          }}>{signerName}</div>
        </div>

        <div className="certificate-field" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#4a5568',
          }}>Signed At:</label>
          <div style={{
            fontSize: '16px',
            color: '#1a202c',
            padding: '8px',
            backgroundColor: '#f7fafc',
            borderRadius: '4px',
          }}>{signedAt}</div>
        </div>

        <div className="certificate-field" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#4a5568',
          }}>Vault Record ID:</label>
          <div style={{
            fontSize: '16px',
            color: '#1a202c',
            padding: '8px',
            backgroundColor: '#f7fafc',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}>{vaultRecordId}</div>
        </div>
      </div>

      <div className="certificate-qr" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '24px',
        gap: '8px',
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}>
          <QRCode value={verificationUrl} size={120} />
        </div>
        <p style={{
          fontSize: '14px',
          color: '#4a5568',
          textAlign: 'center',
        }}>Scan to Verify Document</p>
      </div>

      <div className="certificate-footer" style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#718096',
      }}>
        <p>This certificate confirms that the document has been securely vaulted and anchored to the blockchain.</p>
        <p>Verification URL: <a href={verificationUrl} style={{ color: '#4299e1' }}>{verificationUrl.replace(/^https?:\/\//, '')}</a></p>
        <p style={{ fontSize: '10px', marginTop: '4px' }}>Scan the QR code above to verify this document online</p>
      </div>
    </div>
  );
};

export default CertificateGenerator;
