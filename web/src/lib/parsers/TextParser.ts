import { DocumentParser, ParsedDocument } from './DocumentParser';

export class TextParser implements DocumentParser {
  canHandle(file: File): boolean {
    return file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');
  }

  async parse(file: File): Promise<ParsedDocument> {
    const text = await file.text();
    
    return {
      text,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'text/plain',
      },
      sourceType: 'text',
    };
  }
}
