# Legal Probe

## Overview

Legal Probe is an advanced AI-powered legal document analysis system designed to help law students, legal professionals, and researchers efficiently analyze legal documents through intelligent Q&A interactions. This platform leverages cutting-edge RAG (Retrieval-Augmented Generation) technology with adaptive chunking to provide precise answers with document citations, ensuring reliability and accuracy for legal research.

## Features

- **AI-Powered Document Analysis:** Upload PDF documents and ask natural language questions to get precise, context-aware answers with exact source citations.
- **Adaptive Chunking Technology:** Advanced processing that automatically adjusts document chunking based on document size to maintain context and precision.
- **Strict RAG Responses:** Reliable AI that only answers from uploaded documents or responds with "Not in the document" to prevent hallucination.
- **Hybrid Vector Search:** Combines dense and sparse embeddings for both semantic understanding and exact keyword matching (crucial for legal citations).
- **Real-Time Chat Interface:** Professional chat experience with typing indicators, upload progress, and beautifully formatted responses.
- **User Authentication:** Secure authentication via Supabase with document isolation - users can only access their own uploaded documents.
- **Professional Legal Styling:** Clean, professional interface designed specifically for legal document work with proper citation formatting.

## How It Works

1. **Document Upload:** Users upload PDF legal documents (contracts, briefs, court documents, etc.) through a simple drag-and-drop interface.
2. **Smart Processing:** The system uses adaptive chunking to break down documents while preserving legal context and clause boundaries.
3. **Vector Storage:** Documents are converted into both dense and sparse embeddings and stored in Pinecone with user-specific namespaces.
4. **Intelligent Q&A:** Users ask questions in natural language about their documents.
5. **Precise Answers:** The AI retrieves relevant document sections and provides answers with exact source citations or responds "Not in the document" if the information isn't available.
6. **Source Verification:** Every answer includes document name citations, allowing users to verify and reference the original source material.

### Steps to Run:

#### Prerequisites:
- Node.js (v18 or higher)
- Supabase account
- Pinecone account  
- OpenAI API key

#### 1. Clone the repository:
```bash
git clone https://github.com/SumairSoomro/Legal-RAG.git
cd Legal-RAG
```

#### 2. Backend Setup:
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=legal-rag-index
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

Start the backend server:
```bash
npm run dev
```

#### 3. Frontend Setup:
Open a new terminal and navigate to the frontend:
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend development server:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

#### 4. Database Setup:

**Supabase Setup:**
1. Create a new Supabase project
2. Run the following SQL to create the documents table:
```sql
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  page_count INTEGER NOT NULL,
  chunk_count INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  pinecone_namespace TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can only access their own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);
```

**Pinecone Setup:**
1. Create a new Pinecone index with:
   - Dimensions: 3072 (for OpenAI text-embedding-3-large)
   - Metric: dot
   - Enable sparse vectors
   - Set up with embedding model integration for hybrid search

#### 5. Visit the application:
Open your browser and go to `http://localhost:5173`

## Project Structure

```
Legal-RAG/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── chat/        # Chat interface
│   │   │   ├── documents/   # Document management
│   │   │   └── layout/      # Layout components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── vercel.json          # Vercel deployment config
│   └── package.json
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── answer/          # Answer generation logic
│   │   ├── auth/            # Authentication middleware
│   │   ├── chunking/        # PDF processing and chunking
│   │   ├── config/          # Configuration management
│   │   ├── embedding/       # Embedding generation
│   │   ├── query/           # Hybrid search implementation
│   │   ├── storage/         # Pinecone storage management
│   │   └── index.ts         # Main server file
│   └── package.json
└── README.MD

```

## Deployment

### Frontend (Vercel)
The frontend is configured for Vercel deployment with:
- Automatic SPA routing via `vercel.json`
- Security headers (XSS protection, content type sniffing prevention)
- Optimized build process with Vite

### Backend (Railway/Heroku)
The backend can be deployed to Railway, Heroku, or similar platforms:
- Production build: `npm run build`
- Start command: `npm start`
- Requires environment variables for OpenAI, Pinecone, and Supabase

## Development Commands

### Backend
```bash
npm run dev     # Development server with ts-node
npm run build   # TypeScript compilation
npm run start   # Production server
npm run lint    # ESLint checking
npm run test    # Jest testing
```

### Frontend
```bash
npm run dev     # Vite development server
npm run build   # Production build
npm run preview # Preview production build
npm run lint    # ESLint checking
```

## Technologies Used

### Frontend:
- **React 18** with **TypeScript**
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query (@tanstack/react-query)** for API state management
- **React Router** for navigation
- **Supabase** for authentication
- **Lucide React** for icons

### Backend:
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **OpenAI API** for embeddings and chat completions
- **Pinecone** for vector storage and hybrid search
- **Supabase** for authentication and document metadata
- **Multer** for file upload handling
- **PDF parsing** with pdf-parse library
- **Custom PDFExtractor** with adaptive chunking pipeline

### AI/ML Stack:
- **OpenAI text-embedding-3-large** for dense embeddings (3072 dimensions)
- **Pinecone sparse vectors** with pinecone-sparse-english-v0 for keyword matching
- **GPT-4o-mini** for answer generation
- **Custom hybrid search** combining semantic and lexical retrieval
- **Adaptive chunking** based on document size and structure (~1000 tokens per chunk)
- **GPT-tokenizer** for accurate token counting

## Architecture Highlights

- **Hybrid RAG Pipeline:** Combines dense semantic search with sparse keyword matching for comprehensive legal document retrieval
- **Adaptive Processing:** Document chunking automatically adjusts based on document size (~1000 tokens per chunk with ~200 token overlap)
- **User Isolation:** Each user's documents are stored in separate Pinecone namespaces using Supabase user_id with RLS policies
- **Strict Answer Validation:** AI responses are validated to ensure they only contain information from uploaded documents, responding "Not in the document" otherwise
- **Professional Legal UI:** Interface designed specifically for legal professionals with proper citation formatting
- **Deployment Ready:** Configured for Vercel deployment with proper SPA routing and security headers

## Demo

https://github.com/user-attachments/assets/3bd9634f-7e99-4e9d-904c-a5f2acc98bed



---

**Built for Legal Professionals** - Legal Probe combines the power of modern AI with the precision required for legal research, providing a reliable tool for document analysis that legal professionals can trust.
