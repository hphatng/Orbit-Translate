/**
 * Adapters for exporting extracted data to different formats.
 */

export interface ExportItem {
  term: string;
  translation: string;
  cefrLevel?: string;
  partOfSpeech?: string;
  context?: { original: string; translation: string };
}

export type ExportFormat = 'quizlet' | 'csv' | 'json';

export class ExportAdapter {
  /**
   * Export to Quizlet format (Term - Definition separated by Tab, newlines separated by \n)
   */
  static toQuizlet(items: ExportItem[]): string {
    return items.map(item => `${item.term}\t${item.translation}`).join('\n');
  }

  /**
   * Export to standard CSV format
   */
  static toCsv(items: ExportItem[]): string {
    const headers = ['Term', 'Translation', 'CEFR Level', 'Part of Speech', 'Context'];
    const rows = items.map(item => [
      `"${item.term.replace(/"/g, '""')}"`,
      `"${item.translation.replace(/"/g, '""')}"`,
      `"${item.cefrLevel || ''}"`,
      `"${item.partOfSpeech || ''}"`,
      `"${item.context?.original ? item.context.original.replace(/"/g, '""') : ''}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Export to JSON format
   */
  static toJson(items: ExportItem[]): string {
    return JSON.stringify(items, null, 2);
  }

  static download(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static export(items: ExportItem[], format: ExportFormat, filenamePrefix: string = 'export') {
    switch (format) {
      case 'quizlet':
        this.download(this.toQuizlet(items), `${filenamePrefix}_quizlet.txt`, 'text/plain');
        break;
      case 'csv':
        this.download(this.toCsv(items), `${filenamePrefix}.csv`, 'text/csv');
        break;
      case 'json':
        this.download(this.toJson(items), `${filenamePrefix}.json`, 'application/json');
        break;
    }
  }
}
