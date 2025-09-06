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
export declare const defaultConfig: Config;
export declare function validateConfig(config: Config): void;
//# sourceMappingURL=config.d.ts.map