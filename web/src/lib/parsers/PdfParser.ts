import { DocumentParser, ParsedDocument } from './DocumentParser';

function ensureNodeDomPolyfills() {
  if (typeof globalThis !== 'undefined') {
    if (typeof (globalThis as any).DOMMatrix === 'undefined') {
      (globalThis as any).DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        m11 = 1; m12 = 0; m13 = 0; m14 = 0;
        m21 = 0; m22 = 1; m23 = 0; m24 = 0;
        m31 = 0; m32 = 0; m33 = 1; m34 = 0;
        m41 = 0; m42 = 0; m43 = 0; m44 = 1;
        is2D = true;
        isIdentity = true;
        constructor() {}
      };
    }
    if (typeof (globalThis as any).ImageData === 'undefined') {
      (globalThis as any).ImageData = class ImageData {
        width: number;
        height: number;
        data: Uint8ClampedArray;
        constructor(width: number, height: number) {
          this.width = width;
          this.height = height;
          this.data = new Uint8ClampedArray(width * height * 4);
        }
      };
    }
    if (typeof (globalThis as any).Path2D === 'undefined') {
      (globalThis as any).Path2D = class Path2D {
        constructor() {}
      };
    }
  }
}

export class PdfParser implements DocumentParser {
  canHandle(file: File): boolean {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
  }

  async parse(file: File): Promise<ParsedDocument> {
    ensureNodeDomPolyfills();

    // Lazy dynamic import to prevent top-level serverless module evaluation crashes
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;

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

