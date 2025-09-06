import { EmbeddingService } from '../embedding/embeddings';
import { SearchResult } from '../answer/answer-generator';

export interface SearchConfig {
  topK: number;
  finalChunkCount: number;
  similarityThreshold: number;
  documentSizeHint?: 'small' | 'medium' | 'large';
}

export interface DocumentSizeConfig {
  pageCount: number;
  initialRetrieval: number;
  finalSelection: number;
}

export class HybridSearchService {
  private embeddingService: EmbeddingService;

  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
  }

  getAdaptiveConfig(estimatedPageCount?: number): SearchConfig {
    if (!estimatedPageCount) {
      // Default config for unknown document size
      return {
        topK: 15,
        finalChunkCount: 6,
        similarityThreshold: 0.85
      };
    }

    // Adaptive configuration based on document size
    if (estimatedPageCount <= 20) {
      return {
        topK: 12,
        finalChunkCount: 6,
        similarityThreshold: 0.85,
        documentSizeHint: 'small'
      };
    } else if (estimatedPageCount <= 40) {
      return {
        topK: 16,
        finalChunkCount: 7,
        similarityThreshold: 0.85,
        documentSizeHint: 'medium'
      };
    } else {
      return {
        topK: 20,
        finalChunkCount: 8,
        similarityThreshold: 0.85,
        documentSizeHint: 'large'
      };
    }
  }

  async searchRelevantChunks(
    query: string,
    indexName: string,
    namespace: string,
    config?: SearchConfig
  ): Promise<SearchResult[]> {
    
    const searchConfig = config || this.getAdaptiveConfig();

    try {
      // Step 1: Generate hybrid embeddings for the query
      const queryEmbedding = await this.embeddingService.generateHybridEmbedding(query);

      // Step 2: Search Pinecone with increased topK
      const index = this.embeddingService.pinecone.Index(indexName);
      
      const searchRequest = {
        vector: queryEmbedding.dense.values,
        sparseVector: {
          indices: queryEmbedding.sparse.indices,
          values: queryEmbedding.sparse.values
        },
        topK: searchConfig.topK,
        includeMetadata: true,
        includeValues: false
      };

      const searchResults = await index.namespace(namespace).query(searchRequest);

      if (!searchResults.matches || searchResults.matches.length === 0) {
        return [];
      }

      // Step 3: Format results
      const formattedResults: SearchResult[] = searchResults.matches.map(match => ({
        id: match.id || '',
        score: match.score || 0,
        metadata: {
          text: String(match.metadata?.text || ''),
          documentName: String(match.metadata?.documentName || ''),
          pageNumber: Number(match.metadata?.pageNumber) || 0,
          sectionHeading: String(match.metadata?.sectionHeading || ''),
          chunkIndex: Number(match.metadata?.chunkIndex) || 0
        }
      }));

      // Step 4: Apply semantic deduplication
      const deduplicatedResults = this.deduplicateChunks(formattedResults, searchConfig.similarityThreshold);

      // Step 5: Select final chunks for context
      const finalChunks = this.selectDiverseChunks(deduplicatedResults, searchConfig.finalChunkCount);

      return finalChunks;

    } catch (error) {
      throw new Error(`Failed to search relevant chunks: ${error}`);
    }
  }

  private deduplicateChunks(chunks: SearchResult[], similarityThreshold: number): SearchResult[] {
    if (chunks.length <= 1) return chunks;

    const uniqueChunks: SearchResult[] = [];
    const processedTexts: string[] = [];

    for (const chunk of chunks) {
      const chunkText = chunk.metadata.text.toLowerCase();
      let isDuplicate = false;

      // Check similarity with already processed chunks
      for (const processedText of processedTexts) {
        const similarity = this.calculateTextSimilarity(chunkText, processedText);
        
        if (similarity > similarityThreshold) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        uniqueChunks.push(chunk);
        processedTexts.push(chunkText);
      }
    }

    return uniqueChunks;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity for text deduplication
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private selectDiverseChunks(chunks: SearchResult[], targetCount: number): SearchResult[] {
    if (chunks.length <= targetCount) {
      return chunks;
    }

    // Start with highest scoring chunk
    const selectedChunks: SearchResult[] = [chunks[0]];
    const remainingChunks = chunks.slice(1);

    // Select remaining chunks prioritizing diversity
    while (selectedChunks.length < targetCount && remainingChunks.length > 0) {
      let bestChunk: SearchResult | null = null;
      let bestIndex = -1;
      let bestDiversityScore = -1;

      for (let i = 0; i < remainingChunks.length; i++) {
        const candidate = remainingChunks[i];
        const diversityScore = this.calculateDiversityScore(candidate, selectedChunks);
        
        if (diversityScore > bestDiversityScore) {
          bestDiversityScore = diversityScore;
          bestChunk = candidate;
          bestIndex = i;
        }
      }

      if (bestChunk && bestIndex >= 0) {
        selectedChunks.push(bestChunk);
        remainingChunks.splice(bestIndex, 1);
      } else {
        break;
      }
    }

    return selectedChunks;
  }

  private calculateDiversityScore(candidate: SearchResult, selectedChunks: SearchResult[]): number {
    // Combine relevance score with diversity factors
    let diversityBonus = 0;
    
    // Bonus for different documents
    const candidateDoc = candidate.metadata.documentName;
    const selectedDocs = new Set(selectedChunks.map(c => c.metadata.documentName));
    if (!selectedDocs.has(candidateDoc)) {
      diversityBonus += 0.2;
    }

    // Bonus for different pages
    const candidatePage = candidate.metadata.pageNumber;
    const selectedPages = new Set(selectedChunks.map(c => c.metadata.pageNumber));
    if (!selectedPages.has(candidatePage)) {
      diversityBonus += 0.1;
    }

    // Bonus for different sections
    const candidateSection = candidate.metadata.sectionHeading;
    if (candidateSection) {
      const selectedSections = new Set(
        selectedChunks
          .map(c => c.metadata.sectionHeading)
          .filter(s => s && s.length > 0)
      );
      if (!selectedSections.has(candidateSection)) {
        diversityBonus += 0.1;
      }
    }

    // Combine original relevance score with diversity bonus
    return candidate.score + diversityBonus;
  }

  async analyzeSearchResults(
    _query: string,
    results: SearchResult[]
  ): Promise<{
    totalResults: number;
    scoreRange: { min: number; max: number };
    documentDistribution: Record<string, number>;
    pageDistribution: Record<number, number>;
    avgScore: number;
  }> {
    const analysis = {
      totalResults: results.length,
      scoreRange: {
        min: Math.min(...results.map(r => r.score)),
        max: Math.max(...results.map(r => r.score))
      },
      documentDistribution: {} as Record<string, number>,
      pageDistribution: {} as Record<number, number>,
      avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length
    };

    // Count distribution across documents
    results.forEach(result => {
      const doc = result.metadata.documentName;
      const page = result.metadata.pageNumber;
      
      analysis.documentDistribution[doc] = (analysis.documentDistribution[doc] || 0) + 1;
      analysis.pageDistribution[page] = (analysis.pageDistribution[page] || 0) + 1;
    });

    return analysis;
  }
}