import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { supabase } from './supabase';
import { addCertificateToPdf } from './certificateService';

/**
 * Watermarking service for vaulted documents
 * Creates watermarked copies of original documents for display
 * Also adds verification certificates to PDFs
 */

/**
 * Add a watermark to a PDF document
 * @param pdfBuffer The original PDF buffer
 * @param watermarkText The text to use as watermark
 * @param opacity The opacity of the watermark (0-1)
 * @returns Buffer of the watermarked PDF
 */
export const addWatermarkToPdf = async (
  pdfBuffer: ArrayBuffer,
  watermarkText: string = 'Vaulted by SignVault',
  opacity: number = 0.5
): Promise<Uint8Array> => {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Get the pages
    const pages = pdfDoc.getPages();
    
    // Embed the font
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Add bottom watermark
      page.drawText(watermarkText, {
        x: 50,
        y: 20,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: opacity,
      });
      
      // Add diagonal watermark across the page
      page.drawText(watermarkText, {
        x: width / 2 - 150,
        y: height / 2,
        size: 24,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: opacity * 0.5,
        rotate: degrees(-45),
      });
    }
    
    // Save the modified PDF
    const watermarkedPdfBytes = await pdfDoc.save();
    
    return watermarkedPdfBytes;
  } catch (error) {
    console.error('Error adding watermark to PDF:', error);
    throw error;
  }
};

/**
 * Create a watermarked version of a document and store it
 * @param userId The user ID
 * @param documentId The document ID
 * @param originalFilePath The path to the original file
 * @param vaultDate The date the document was vaulted
 * @returns The path to the watermarked file
 */
export const createWatermarkedVersion = async (
  userId: string,
  documentId: string,
  originalFilePath: string,
  vaultDate: string
): Promise<string> => {
  try {
    // Download the original file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(originalFilePath);
      
    if (downloadError) {
      throw new Error(`Error downloading original file: ${downloadError.message}`);
    }
    
    // Format the vault date
    const formattedDate = new Date(vaultDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Create watermark text
    const watermarkText = `Vaulted by SignVault — Authoritative Copy — Vaulted on ${formattedDate}`;
    
    // Get user information for the certificate
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();
      
    // Default signer name if user data not available
    const signerName = userData?.full_name || 'Document Owner';
    
    // Generate verification URL with configurable base URL
    // Use environment variable or fallback to a production URL
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://signvault.com';
    const verificationUrl = `${baseUrl}/verify/${documentId}`;
    
    // First add watermark to the PDF
    const watermarkedPdfBytes = await addWatermarkToPdf(
      await fileData.arrayBuffer(),
      watermarkText,
      0.5
    );
    
    // Get file hash if available
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .select('file_hash')
      .eq('id', documentId)
      .single();
      
    const fileHash = documentData?.file_hash;
    
    // Then add certificate to the watermarked PDF
    const pdfWithCertificateBytes = await addCertificateToPdf(
      watermarkedPdfBytes.buffer,
      signerName,
      formattedDate,
      documentId,
      verificationUrl,
      fileHash
    );
    
    // Create the watermarked file path
    const watermarkedFilePath = originalFilePath.replace(
      'vaulted/',
      'vaulted/watermarked/'
    );
    
    // Upload the watermarked file with certificate
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(watermarkedFilePath, pdfWithCertificateBytes, {
        contentType: 'application/pdf',
      });
      
    if (uploadError) {
      throw new Error(`Error uploading watermarked file: ${uploadError.message}`);
    }
    
    return watermarkedFilePath;
  } catch (error) {
    console.error('Error creating watermarked version:', error);
    throw error;
  }
};

/**
 * Get or create a watermarked version of a document
 * @param userId The user ID
 * @param documentId The document ID
 * @param originalFilePath The path to the original file
 * @param vaultDate The date the document was vaulted
 * @returns The URL to the watermarked document
 */
export const getOrCreateWatermarkedVersion = async (
  userId: string,
  documentId: string,
  originalFilePath: string,
  vaultDate: string
): Promise<string> => {
  try {
    // Check if watermarked version already exists
    const watermarkedFilePath = originalFilePath.replace(
      'vaulted/',
      'vaulted/watermarked/'
    );
    
    const { data: fileExists } = await supabase.storage
      .from('documents')
      .list(watermarkedFilePath.split('/').slice(0, -1).join('/'));
      
    // If watermarked version doesn't exist, create it
    if (!fileExists || fileExists.length === 0) {
      await createWatermarkedVersion(userId, documentId, originalFilePath, vaultDate);
    }
    
    // Get a signed URL for the watermarked version
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(watermarkedFilePath, 60 * 60); // 1 hour expiry
      
    if (error) {
      throw new Error(`Error creating signed URL: ${error.message}`);
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting watermarked version:', error);
    throw error;
  }
};
