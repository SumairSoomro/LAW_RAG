import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { DocumentChunk } from '../chunking/pdf-extractor';

export interface DenseEmbedding {
  values: number[];
  dimension: number;
}

export interface SparseEmbedding {
  indices: number[];
  values: number[];
}

export interface HybridEmbedding {
  dense: DenseEmbedding;
  sparse: SparseEmbedding;
  text: string;
  metadata: any;
}

export interface EmbeddingBatch {
  embeddings: HybridEmbedding[];
  totalTokens: number;
}

export class EmbeddingService {
  private openai: OpenAI;
  public pinecone: Pinecone;
  private batchSize: number;

  constructor(
    openaiApiKey: string,
    pineconeApiKey: string,
    batchSize: number = 100
  ) {
    this.openai = new OpenAI({
      apiKey: openaiApiKey
    });
    
    this.pinecone = new Pinecone({
      apiKey: pineconeApiKey
    });
    
    this.batchSize = batchSize;
  }

  async generateDenseEmbedding(text: string): Promise<DenseEmbedding> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: text,
        encoding_format: 'float'
      });

      return {
        values: response.data[0].embedding,
        dimension: response.data[0].embedding.length
      };
    } catch (error) {
      throw new Error(`Failed to generate dense embedding: ${error}`);
    }
  }

  async generateDenseEmbeddingsBatch(texts: string[]): Promise<DenseEmbedding[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: texts,
        encoding_format: 'float'
      });

      return response.data.map(embedding => ({
        values: embedding.embedding,
        dimension: embedding.embedding.length
      }));
    } catch (error) {
      throw new Error(`Failed to generate dense embeddings batch: ${error}`);
    }
  }

  async generateSparseEmbedding(text: string): Promise<SparseEmbedding> {
    try {
      const response = await this.pinecone.inference.embed(
        'pinecone-sparse-english-v0',
        [text],
        {
          inputType: 'passage',
          truncate: 'END'
        }
      );


      const embedding = response.data[0];
      if (embedding.vectorType !== 'sparse') {
        throw new Error('Expected sparse embedding but received different type');
      }

      // The sparse embedding might have different structure
      const sparseEmbedding = embedding as any;
      
      // Check if it has the asSparse() method (newer SDK)
      if (typeof sparseEmbedding.asSparse === 'function') {
        const sparse = sparseEmbedding.asSparse();
        return {
          indices: sparse.indices,
          values: sparse.values
        };
      }
      
      // Check for direct properties
      if (sparseEmbedding.indices && sparseEmbedding.values) {
        return {
          indices: sparseEmbedding.indices,
          values: sparseEmbedding.values
        };
      }
      
      // Check for Pinecone specific structure (sparseIndices, sparseValues)
      if (sparseEmbedding.sparseIndices && sparseEmbedding.sparseValues) {
        return {
          indices: sparseEmbedding.sparseIndices,
          values: sparseEmbedding.sparseValues
        };
      }
      
      // Check for nested structure
      if (sparseEmbedding.values && sparseEmbedding.values.indices) {
        return {
          indices: sparseEmbedding.values.indices,
          values: sparseEmbedding.values.values
        };
      }

      throw new Error(`Unexpected sparse embedding structure: ${JSON.stringify(embedding)}`);
    } catch (error) {
      throw new Error(`Failed to generate sparse embedding: ${error}`);
    }
  }

  async generateSparseEmbeddingsBatch(texts: string[]): Promise<SparseEmbedding[]> {
    try {
      const response = await this.pinecone.inference.embed(
        'pinecone-sparse-english-v0',
        texts,
        {
          inputType: 'passage',
          truncate: 'END'
        }
      );

      return response.data.map(embedding => {
        if (embedding.vectorType !== 'sparse') {
          throw new Error('Expected sparse embedding but received different type');
        }

        const sparseEmbedding = embedding as any;
        
        // Check for Pinecone specific structure (sparseIndices, sparseValues)
        if (sparseEmbedding.sparseIndices && sparseEmbedding.sparseValues) {
          return {
            indices: sparseEmbedding.sparseIndices,
            values: sparseEmbedding.sparseValues
          };
        }
        
        // Check for direct properties (fallback)
        if (sparseEmbedding.indices && sparseEmbedding.values) {
          return {
            indices: sparseEmbedding.indices,
            values: sparseEmbedding.values
          };
        }
        
        throw new Error(`Unexpected sparse embedding structure: ${JSON.stringify(embedding)}`);
      });
    } catch (error) {
      throw new Error(`Failed to generate sparse embeddings batch: ${error}`);
    }
  }

  async generateHybridEmbedding(
    text: string,
    metadata: any = {}
  ): Promise<HybridEmbedding> {
    const [denseEmbedding, sparseEmbedding] = await Promise.all([
      this.generateDenseEmbedding(text),
      this.generateSparseEmbedding(text)
    ]);

    return {
      dense: denseEmbedding,
      sparse: sparseEmbedding,
      text,
      metadata
    };
  }

  async generateHybridEmbeddingsBatch(
    texts: string[],
    metadataArray: any[] = []
  ): Promise<HybridEmbedding[]> {
    const [denseEmbeddings, sparseEmbeddings] = await Promise.all([
      this.generateDenseEmbeddingsBatch(texts),
      this.generateSparseEmbeddingsBatch(texts)
    ]);

    return texts.map((text, index) => ({
      dense: denseEmbeddings[index],
      sparse: sparseEmbeddings[index],
      text,
      metadata: metadataArray[index] || {}
    }));
  }

  async embedDocumentChunks(chunks: DocumentChunk[]): Promise<EmbeddingBatch> {
    const embeddings: HybridEmbedding[] = [];
    let totalTokens = 0;

    for (let i = 0; i < chunks.length; i += this.batchSize) {
      const batch = chunks.slice(i, i + this.batchSize);
      const texts = batch.map(chunk => chunk.text);
      const metadataArray = batch.map(chunk => chunk.metadata);

      try {
        const batchEmbeddings = await this.generateHybridEmbeddingsBatch(texts, metadataArray);
        embeddings.push(...batchEmbeddings);
        
        totalTokens += texts.reduce((sum, text) => sum + this.estimateTokenCount(text), 0);
        
        if (i + this.batchSize < chunks.length) {
          await this.delay(100);
        }
      } catch (error) {
        throw new Error(`Failed to embed chunk batch starting at index ${i}: ${error}`);
      }
    }

    return {
      embeddings,
      totalTokens
    };
  }

  async embedQuery(query: string): Promise<HybridEmbedding> {
    return this.generateHybridEmbedding(query);
  }

  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async validateEmbeddings(): Promise<boolean> {
    try {
      const testText = "This is a test embedding.";
      const embedding = await this.generateHybridEmbedding(testText);
      
      return (
        embedding.dense.values.length > 0 &&
        embedding.sparse.indices.length > 0 &&
        embedding.sparse.values.length === embedding.sparse.indices.length
      );
    } catch (error) {
      console.error('Embedding validation failed:', error);
      return false;
    }
  }

  async upsertToPinecone(
    indexName: string,
    namespace: string,
    records: Array<{
      id: string;
      values: number[];
      sparseValues?: { indices: number[]; values: number[] };
      metadata?: Record<string, any>;
    }>
  ): Promise<void> {
    try {
      const index = this.pinecone.Index(indexName);
      
      const vectors = records.map(record => {
        const vector: any = {
          id: record.id,
          values: record.values
        };
        
        if (record.sparseValues) {
          vector.sparseValues = record.sparseValues;
        }
        
        if (record.metadata) {
          vector.metadata = record.metadata;
        }
        
        return vector;
      });

      await index.namespace(namespace).upsert(vectors);
    } catch (error) {
      throw new Error(`Failed to upsert to Pinecone:`);
    }
  }
}