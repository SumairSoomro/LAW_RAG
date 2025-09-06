# Legal Document RAG System

A TypeScript/Node.js backend for Retrieval-Augmented Generation (RAG) with legal documents using hybrid search combining OpenAI embeddings and Pinecone sparse vectors.

## Features

- **PDF Text Extraction**: Extract and chunk legal documents with metadata
- **Hybrid Embeddings**: Dense vectors (OpenAI) + Sparse vectors (Pinecone)
- **Semantic Search**: Query documents using natural language
- **Grounded Answers**: Generate answers with source citations
- **Document Management**: Store, update, and delete document collections

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Build and run**:
   ```bash
   npm run build
   npm start
   ```

## Usage Example

```typescript
import { LawRAGSystem } from './src';

const rag = new LawRAGSystem();
await rag.initialize();

// Process a legal document
await rag.processDocument('./legal-doc.pdf', 'Contract Law Guide');

// Ask questions
const answer = await rag.askQuestion('What are the requirements for contract formation?');
console.log(answer);

// Get detailed response with sources
const detailed = await rag.askQuestionWithSources('What constitutes breach of contract?');
console.log(detailed.answer);
console.log(detailed.sources);
```

## Architecture

- **Chunking** (`src/chunking/`): PDF extraction and text segmentation (~1000 tokens, 200 overlap)
- **Embedding** (`src/embedding/`): OpenAI text-embedding-3-large + Pinecone sparse vectors
- **Storage** (`src/storage/`): Pinecone hybrid index management
- **Query** (`src/query/`): Hybrid search with semantic and lexical matching
- **Answer** (`src/answer/`): GPT-4 powered answer generation with citations

## Configuration

Environment variables in `.env`:

```env
OPENAI_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
PINECONE_INDEX_NAME=law-documents
```

## API Reference

### LawRAGSystem

Main class that orchestrates all components:

- `initialize()`: Set up connections to OpenAI and Pinecone
- `processDocument(pdfPath, name)`: Extract, chunk, embed and store document
- `askQuestion(query)`: Get answer from documents
- `askQuestionWithSources(query)`: Get answer with source citations
- `searchDocuments(query, topK)`: Search for relevant chunks
- `deleteDocument(name)`: Remove document from index

### Individual Components

Each module can be used independently:
- `PDFExtractor`: Handle PDF processing and chunking
- `EmbeddingService`: Create dense and sparse embeddings
- `PineconeStorage`: Manage vector storage operations
- `HybridSearchService`: Perform hybrid semantic searches
- `AnswerGenerator`: Generate contextual answers

## Development

```bash
npm run dev     # Run with ts-node
npm run build   # Compile TypeScript
npm run test    # Run tests
npm run lint    # Check code style
```