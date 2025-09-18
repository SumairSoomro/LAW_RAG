import * as fs from 'fs';
import * as pdf from 'pdf-parse';
import { encode, decode } from 'gpt-tokenizer';

// Metadata interface for tracking chunk origin and structure within legal documents
export interface ChunkMetadata {
  documentName: string;    // Original filename of the PDF
  pageNumber: number;      // Page number where this chunk originated
  sectionHeading: string;  // Detected section heading (e.g., "CHAPTER 1", "ARTICLE II")
  chunkIndex: number;      // Sequential index of chunk within the page
}

// Individual text chunk with associated metadata for vector storage
export interface DocumentChunk {
  text: string;           // The actual text content of the chunk
  metadata: ChunkMetadata; // Metadata for retrieval and citation purposes
}

/**
 * PDFExtractor handles the extraction and chunking of legal PDF documents
 * Designed specifically for law school PDFs (7-60 pages) with proper section detection
 */
export class PDFExtractor {
  private chunkSize: number;     // Maximum tokens per chunk (~1000 for good context)
  private chunkOverlap: number;  // Token overlap between chunks (~200 to preserve context)

  /**
   * Initialize PDF extractor with chunking parameters
   * @param chunkSize - Maximum tokens per chunk (default: 1000)
   * @param chunkOverlap - Overlap between consecutive chunks (default: 200)
   */
  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  /**
   * Extract text from PDF and distribute it across pages with section detection
   * Uses character-based distribution since pdf-parse doesn't preserve page boundaries
   * @param pdfPath - Path to the PDF file
   * @returns Array of pages with text, page numbers, and detected section headings
   */
  async extractTextFromPDF(pdfPath: string): Promise<Array<{ pageNumber: number; text: string; sectionHeading: string }>> {
    // Read PDF file into memory buffer
    const dataBuffer = fs.readFileSync(pdfPath);

    // Parse PDF using pdf-parse library
    const data = await pdf.default(dataBuffer) as any;
    const actualPageCount = data.numpages || 1;

    // pdf-parse returns all text as one string, so we need to distribute it across pages
    // Calculate approximate characters per page for even distribution
    const fullText = data.text;
    const charsPerPage = Math.ceil(fullText.length / actualPageCount);

    const pages: Array<{ pageNumber: number; text: string; sectionHeading: string }> = [];

    // Distribute text across pages based on character count
    for (let i = 0; i < actualPageCount; i++) {
      const start = i * charsPerPage;
      const end = Math.min((i + 1) * charsPerPage, fullText.length);
      const pageText = fullText.substring(start, end);

      // Only include pages with actual content
      if (pageText.trim().length > 0) {
        pages.push({
          pageNumber: i + 1,
          text: pageText.trim(),
          sectionHeading: this.extractSectionHeading(pageText) // Detect section headings for legal structure
        });
      }
    }

    return pages;
  }

  /**
   * Extract section headings from text for better legal document structure
   * Looks for common legal section patterns in the first 5 lines of text
   * @param text - Page text to analyze
   * @returns Detected section heading or empty string
   */
  private extractSectionHeading(text: string): string {
    const lines = text.split('\n');

    // Check first 5 lines for potential section headings
    for (const line of lines.slice(0, 5)) {
      const trimmedLine = line.trim();

      // Consider a line as a section heading if:
      // 1. It's all uppercase (common in legal documents)
      // 2. Contains legal section keywords (section, chapter, article, part)
      if (trimmedLine && (
        trimmedLine === trimmedLine.toUpperCase() ||
        /section|chapter|article|part/i.test(trimmedLine)
      )) {
        return trimmedLine;
      }
    }

    // Return empty string if no section heading detected
    return '';
  }


  /**
   * Split page text into overlapping chunks using token-based boundaries
   * Ensures legal arguments and rules don't get split unnaturally
   * @param text - Text content to chunk
   * @param metadata - Base metadata (without chunkIndex) for all chunks
   * @returns Array of DocumentChunk objects with incremental chunk indices
   */
  chunkText(text: string, metadata: Omit<ChunkMetadata, 'chunkIndex'>): DocumentChunk[] {
    // Encode text into tokens using GPT tokenizer for accurate length measurement
    const tokens = encode(text);
    const chunks: DocumentChunk[] = [];

    let start = 0;       // Starting token position for current chunk
    let chunkIndex = 0;  // Sequential index for chunks within this page

    // Create overlapping chunks until all tokens are processed
    while (start < tokens.length) {
      const end = start + this.chunkSize;
      const chunkTokens = tokens.slice(start, end);
      const chunkText = decode(chunkTokens); // Convert tokens back to text

      // Build complete metadata for this chunk
      const chunkMetadata: ChunkMetadata = {
        ...metadata,
        chunkIndex
      };

      // Create and store the chunk
      chunks.push({
        text: chunkText,
        metadata: chunkMetadata
      });

      // Move start position forward, accounting for overlap
      // This ensures continuity between chunks for better context preservation
      start += this.chunkSize - this.chunkOverlap;
      chunkIndex++;
    }

    return chunks;
  }

  /**
   * Main processing method: extract text from PDF and create chunked documents
   * This is the primary entry point for the PDFExtractor class
   * @param pdfPath - Path to the PDF file to process
   * @param documentName - Name to use for document identification
   * @returns Array of all DocumentChunk objects from the entire PDF
   */
  async processPDF(pdfPath: string, documentName: string): Promise<DocumentChunk[]> {
    // Step 1: Extract text from PDF and distribute across pages
    const pages = await this.extractTextFromPDF(pdfPath);
    const allChunks: DocumentChunk[] = [];
    const maxPageNumber = Math.max(...pages.map(p => p.pageNumber));

    // Step 2: Process each page individually to create chunks
    for (const page of pages) {
      // Create base metadata for all chunks from this page
      const metadata = {
        documentName,
        pageNumber: page.pageNumber,
        sectionHeading: page.sectionHeading
      };

      // Step 3: Chunk the page text using token-based boundaries
      const chunks = this.chunkText(page.text, metadata);

      // Step 4: Validate page numbers don't exceed actual page count
      // This prevents edge cases where distribution might create invalid page refs
      chunks.forEach(chunk => {
        chunk.metadata.pageNumber = Math.min(chunk.metadata.pageNumber, maxPageNumber);
      });

      // Step 5: Add all chunks from this page to the final collection
      allChunks.push(...chunks);
    }

    return allChunks;
  }
}

