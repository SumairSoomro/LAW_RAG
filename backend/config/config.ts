

export interface Config {
  openai: {
    apiKey: string;
    embeddingModel: string;
    chatModel: string;
  };
  pinecone: {
    apiKey: string;
    indexName: string;
    environment: string;
  };
  chunking: {
    chunkSize: number;
    chunkOverlap: number;
  };
  search: {
    defaultTopK: number;
    maxChunksForAnswer: number;
  };
  generation: {
    temperature: number;
    maxTokens: number;
  };
}

export const defaultConfig: Config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    embeddingModel: 'text-embedding-3-large',
    chatModel: 'gpt-4'
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    indexName: process.env.PINECONE_INDEX_NAME || 'law',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1'
  },
  chunking: {
    chunkSize: 1000,
    chunkOverlap: 200
  },
  search: {
    defaultTopK: 10,
    maxChunksForAnswer: 8
  },
  generation: {
    temperature: 0.1,
    maxTokens: 1000
  }
};

export function validateConfig(config: Config): void {
  if (!config.openai.apiKey) {
    throw new Error('OpenAI API key is required');
  }
  
  if (!config.pinecone.apiKey) {
    throw new Error('Pinecone API key is required');
  }
  
  if (!config.pinecone.indexName) {
    throw new Error('Pinecone index name is required');
  }
}