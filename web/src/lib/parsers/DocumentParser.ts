export interface ParsedDocument {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    [key: string]: unknown;
  };
  pageCount?: number;
  sourceType: string; // 'pdf', 'docx', 'text'
  warnings?: string[];
}

export interface DocumentParser {
  /**
   * Determines if this parser can handle the given file
   */
  canHandle(file: File): boolean;

  /**
   * Parses the file and returns the extracted text and metadata
   */
  parse(file: File): Promise<ParsedDocument>;
}
