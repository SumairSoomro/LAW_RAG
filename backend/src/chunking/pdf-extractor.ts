import * as fs from 'fs';
import * as pdf from 'pdf-parse';
import { encode, decode } from 'gpt-tokenizer';

export interface ChunkMetadata {
  documentName: string;
  pageNumber: number;
  sectionHeading: string;
  chunkIndex: number;
}

export interface DocumentChunk {
  text: string;
  metadata: ChunkMetadata;
}

export class PDFExtractor {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  async extractTextFromPDF(pdfPath: string): Promise<Array<{ pageNumber: number; text: string; sectionHeading: string }>> {
    const dataBuffer = fs.readFileSync(pdfPath);
    
    const data = await pdf.default(dataBuffer) as any;
    const actualPageCount = data.numpages || 1;
    
    // Always use actual page count for accurate distribution
    const fullText = data.text;
    const charsPerPage = Math.ceil(fullText.length / actualPageCount);
    
    const pages: Array<{ pageNumber: number; text: string; sectionHeading: string }> = [];
    
    for (let i = 0; i < actualPageCount; i++) {
      const start = i * charsPerPage;
      const end = Math.min((i + 1) * charsPerPage, fullText.length);
      const pageText = fullText.substring(start, end);
      
      if (pageText.trim().length > 0) {
        pages.push({
          pageNumber: i + 1,
          text: pageText.trim(),
          sectionHeading: this.extractSectionHeading(pageText)
        });
      }
    }

    return pages;
  }

  private extractSectionHeading(text: string): string {
    const lines = text.split('\n');
    for (const line of lines.slice(0, 5)) {
      const trimmedLine = line.trim();
      if (trimmedLine && (
        trimmedLine === trimmedLine.toUpperCase() ||
        /section|chapter|article|part/i.test(trimmedLine)
      )) {
        return trimmedLine;
      }
    }
    return '';
  }


  chunkText(text: string, metadata: Omit<ChunkMetadata, 'chunkIndex'>): DocumentChunk[] {
    const tokens = encode(text);
    const chunks: DocumentChunk[] = [];
    
    let start = 0;
    let chunkIndex = 0;
    
    while (start < tokens.length) {
      const end = start + this.chunkSize;
      const chunkTokens = tokens.slice(start, end);
      const chunkText = decode(chunkTokens);
      
      const chunkMetadata: ChunkMetadata = {
        ...metadata,
        chunkIndex
      };
      
      chunks.push({
        text: chunkText,
        metadata: chunkMetadata
      });
      
      start += this.chunkSize - this.chunkOverlap;
      chunkIndex++;
    }
    
    return chunks;
  }

  async processPDF(pdfPath: string, documentName: string): Promise<DocumentChunk[]> {
    const pages = await this.extractTextFromPDF(pdfPath);
    const allChunks: DocumentChunk[] = [];
    const maxPageNumber = Math.max(...pages.map(p => p.pageNumber));
    
    for (const page of pages) {
      const metadata = {
        documentName,
        pageNumber: page.pageNumber,
        sectionHeading: page.sectionHeading
      };
      
      const chunks = this.chunkText(page.text, metadata);
      // Ensure no chunk exceeds the actual page count
      chunks.forEach(chunk => {
        chunk.metadata.pageNumber = Math.min(chunk.metadata.pageNumber, maxPageNumber);
      });
      allChunks.push(...chunks);
    }
    
    return allChunks;
  }
}

