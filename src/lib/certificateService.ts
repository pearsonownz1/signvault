import { PDFDocument, rgb, StandardFonts, PDFImage, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

/**
 * Certificate service for adding verification certificates to PDFs
 */

/**
 * Generate a QR code as a data URL
 * @param url The URL to encode in the QR code
 * @returns A data URL containing the QR code image
 */
export const generateQRCode = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Add a verification certificate to the end of a PDF
 * @param pdfBuffer The original PDF buffer
 * @param signerName The name of the signer
 * @param signedAt The timestamp when the document was signed
 * @param vaultRecordId The unique blockchain reference for the document
 * @param verificationUrl The URL to verify the document
 * @returns Buffer of the PDF with certificate added
 */
export const addCertificateToPdf = async (
  pdfBuffer: ArrayBuffer,
  signerName: string,
  signedAt: string,
  vaultRecordId: string,
  verificationUrl: string,
  fileHash?: string
): Promise<Uint8Array> => {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Create a new page for the certificate
    const certificatePage = pdfDoc.addPage();
    
    // Set page dimensions
    const { width, height } = certificatePage.getSize();
    
    // Embed the fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
    
    // Calculate positions
    const margin = 50;
    const contentWidth = width - (margin * 2);
    
    // Load and embed the logo
    let logoImage;
    try {
      // For browser environments, fetch the logo
      if (typeof window !== 'undefined') {
        const logoResponse = await fetch('/logo.png');
        const logoArrayBuffer = await logoResponse.arrayBuffer();
        logoImage = await pdfDoc.embedPng(logoArrayBuffer);
      } else {
        // For Node.js environments (if applicable)
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        const logoBytes = fs.readFileSync(logoPath);
        logoImage = await pdfDoc.embedPng(logoBytes);
      }
    } catch (logoError) {
      console.warn('Could not load logo image:', logoError);
      // Continue without the logo
    }
    
    // Draw certificate background
    certificatePage.drawRectangle({
      x: margin,
      y: margin,
      width: contentWidth,
      height: height - (margin * 2),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });
    
    // Draw header background
    certificatePage.drawRectangle({
      x: margin,
      y: height - margin - 100,
      width: contentWidth,
      height: 100,
      color: rgb(0.97, 0.97, 0.97),
    });
    
    // Draw logo if available
    if (logoImage) {
      const logoSize = 60;
      certificatePage.drawImage(logoImage, {
        x: margin + 20,
        y: height - margin - 80,
        width: logoSize,
        height: logoSize,
      });
    }
    
    // Draw certificate title
    certificatePage.drawText('Certificate of Vault', {
      x: margin + (logoImage ? 100 : 20),
      y: height - margin - 50,
      size: 24,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    // Draw subtitle
    const subtitle = 'Official Blockchain Verification';
    certificatePage.drawText(subtitle, {
      x: margin + (logoImage ? 100 : 20),
      y: height - margin - 75,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Draw watermark
    certificatePage.drawText('SignVault', {
      x: width / 2 - boldFont.widthOfTextAtSize('SignVault', 60) / 2,
      y: height / 2,
      size: 60,
      font: boldFont,
      color: rgb(0.95, 0.95, 0.95),
      opacity: 0.2,
      rotate: degrees(-45),
    });
    
    // Draw document information section
    const sectionY = height - margin - 120;
    
    // Section title
    certificatePage.drawText('Document Information', {
      x: margin + 20,
      y: sectionY - 30,
      size: 16,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Draw horizontal line
    certificatePage.drawLine({
      start: { x: margin + 20, y: sectionY - 40 },
      end: { x: width - margin - 20, y: sectionY - 40 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    // Document details
    const startY = sectionY - 70;
    const lineHeight = 25;
    const labelX = margin + 30;
    const valueX = margin + 180;
    
    // Signer Name
    certificatePage.drawText('Signer Name:', {
      x: labelX,
      y: startY,
      size: 11,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    certificatePage.drawText(signerName, {
      x: valueX,
      y: startY,
      size: 11,
      font: font,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    // Signed At
    certificatePage.drawText('Signed At:', {
      x: labelX,
      y: startY - lineHeight,
      size: 11,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    certificatePage.drawText(signedAt, {
      x: valueX,
      y: startY - lineHeight,
      size: 11,
      font: font,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    // Vault Record ID
    certificatePage.drawText('Vault Record ID:', {
      x: labelX,
      y: startY - (lineHeight * 2),
      size: 11,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    certificatePage.drawText(vaultRecordId, {
      x: valueX,
      y: startY - (lineHeight * 2),
      size: 11,
      font: font,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    // Document Proof section
    const proofSectionY = startY - (lineHeight * 3) - 30;
    
    // Section title
    certificatePage.drawText('Document Proof', {
      x: margin + 20,
      y: proofSectionY,
      size: 16,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Draw horizontal line
    certificatePage.drawLine({
      start: { x: margin + 20, y: proofSectionY - 10 },
      end: { x: width - margin - 20, y: proofSectionY - 10 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    // File Hash
    if (fileHash) {
      certificatePage.drawText('File Hash (SHA-256):', {
        x: labelX,
        y: proofSectionY - 30,
        size: 11,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Draw hash in a box with monospace font
      certificatePage.drawRectangle({
        x: labelX,
        y: proofSectionY - 55,
        width: width - (margin * 2) - 60,
        height: 20,
        color: rgb(0.97, 0.97, 0.97),
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 1,
      });
      
      certificatePage.drawText(fileHash, {
        x: labelX + 5,
        y: proofSectionY - 50,
        size: 8,
        font: monoFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      // Integrity Status
      certificatePage.drawText('Integrity Status:', {
        x: labelX,
        y: proofSectionY - 80,
        size: 11,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Draw verified badge
      const verifiedText = 'Verified';
      certificatePage.drawRectangle({
        x: valueX,
        y: proofSectionY - 90,
        width: font.widthOfTextAtSize(verifiedText, 11) + 20,
        height: 20,
        color: rgb(0.9, 1.0, 0.9),
        borderColor: rgb(0.7, 0.9, 0.7),
        borderWidth: 1,
      });
      
      certificatePage.drawText(verifiedText, {
        x: valueX + 10,
        y: proofSectionY - 80,
        size: 11,
        font: boldFont,
        color: rgb(0.0, 0.6, 0.0),
      });
    }
    
    // QR Code section
    const qrSectionY = proofSectionY - (fileHash ? 120 : 40);
    
    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(verificationUrl);
    const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
    
    // Draw QR code
    const qrCodeSize = 120;
    certificatePage.drawImage(qrCodeImage, {
      x: width / 2 - qrCodeSize / 2,
      y: qrSectionY - qrCodeSize,
      width: qrCodeSize,
      height: qrCodeSize,
    });
    
    // Draw QR code label
    const qrLabel = 'Scan to Verify Document';
    certificatePage.drawText(qrLabel, {
      x: width / 2 - font.widthOfTextAtSize(qrLabel, 12) / 2,
      y: qrSectionY - qrCodeSize - 20,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Display a cleaner verification URL (without http/https prefix)
    const displayUrl = verificationUrl.replace(/^https?:\/\//, '');
    const urlText = `${displayUrl}`;
    
    certificatePage.drawText(urlText, {
      x: width / 2 - font.widthOfTextAtSize(urlText, 10) / 2,
      y: qrSectionY - qrCodeSize - 40,
      size: 10,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Footer
    const footerY = margin + 30;
    
    // Draw horizontal line
    certificatePage.drawLine({
      start: { x: margin + 20, y: footerY + 20 },
      end: { x: width - margin - 20, y: footerY + 20 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    
    // Footer text
    const footerText = 'This certificate confirms that the document has been securely vaulted and anchored to the blockchain.';
    certificatePage.drawText(footerText, {
      x: width / 2 - font.widthOfTextAtSize(footerText, 9) / 2,
      y: footerY,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Save the modified PDF
    const pdfWithCertificateBytes = await pdfDoc.save();
    
    return pdfWithCertificateBytes;
  } catch (error) {
    console.error('Error adding certificate to PDF:', error);
    throw error;
  }
};
