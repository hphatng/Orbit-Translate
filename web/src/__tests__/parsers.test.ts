import { describe, it, expect } from 'vitest';
import { TextParser, DocxParser, PdfParser } from '@/lib/parsers';

describe('Document Parsers', () => {
  it('TextParser handles text files', async () => {
    const parser = new TextParser();
    const file = new File(['Hello world from Orbit Translate!'], 'test.txt', { type: 'text/plain' });
    expect(parser.canHandle(file)).toBe(true);
    const result = await parser.parse(file);
    expect(result.text).toContain('Hello world');
    expect(result.sourceType).toBe('text');
  });

  it('DocxParser detects docx format', () => {
    const parser = new DocxParser();
    const file = new File([''], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    expect(parser.canHandle(file)).toBe(true);
  });

  it('PdfParser detects pdf format without throwing DOMMatrix error', () => {
    const parser = new PdfParser();
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    expect(parser.canHandle(file)).toBe(true);
  });
});
