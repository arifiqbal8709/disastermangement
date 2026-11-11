import fs from 'fs';
import pdfParse from 'pdf-parse';
import { logger } from '../utils/logger.js';

export const PDFService = {
  /**
   * Extract text and metadata from a PDF file buffer or path
   */
  extractText: async (filePathOrBuffer) => {
    try {
      let dataBuffer;
      if (typeof filePathOrBuffer === 'string') {
        dataBuffer = fs.readFileSync(filePathOrBuffer);
      } else {
        dataBuffer = filePathOrBuffer;
      }

      const data = await pdfParse(dataBuffer);

      const rawText = data.text ? data.text.trim() : '';
      const numPages = data.numpages || 1;
      const info = data.info || {};

      // If text extracted is extremely short relative to page count, it is likely a scanned image PDF
      const isScanned = rawText.length < 50;

      logger.info(`PDF parsed: ${numPages} page(s), ${rawText.length} characters extracted.`);

      return {
        success: true,
        text: rawText,
        pages: numPages,
        charCount: rawText.length,
        isScanned,
        metadata: {
          title: info.Title || null,
          author: info.Author || null,
          creator: info.Creator || null,
          producer: info.Producer || null,
          creationDate: info.CreationDate || null
        }
      };
    } catch (err) {
      logger.error('Error parsing PDF document:', { error: err.message });
      throw new Error(`Failed to extract text from PDF: ${err.message}`);
    }
  },

  /**
   * Clean and normalize extracted text for AI context ingestion
   */
  sanitizeText: (text, maxChars = 20000) => {
    if (!text) return '';
    // Normalize excessive whitespace and page break artifacts
    const sanitized = text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return sanitized.length > maxChars ? sanitized.substring(0, maxChars) + '\n...[Content truncated for analysis token limit]' : sanitized;
  }
};
