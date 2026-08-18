import { DocumentParser, ParsedDocument } from './DocumentParser';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

export class PdfParser implements DocumentParser {
  canHandle(file: File): boolean {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
  }

  async parse(file: File): Promise<ParsedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const data = await pdfParse(buffer);
    const text = data.text || '';
    
    const warnings: string[] = [];
    if (!text.trim()) {
      warnings.push('NO_TEXT_DETECTED'); // Flag for OCR fallback
    }

    return {
      text,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/pdf',
      },
      pageCount: data.numpages,
      sourceType: 'pdf',
      warnings
    };
  }
}
