import { DocumentParser, ParsedDocument } from './DocumentParser';
import mammoth from 'mammoth';

export class DocxParser implements DocumentParser {
  canHandle(file: File): boolean {
    return (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    );
  }

  async parse(file: File): Promise<ParsedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    
    // mammoth needs a buffer
    const buffer = Buffer.from(arrayBuffer);
    
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      text: result.value,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      sourceType: 'docx',
      warnings: result.messages.map(m => m.message)
    };
  }
}
