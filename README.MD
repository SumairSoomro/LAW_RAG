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
   - Metric: cosine
   - Enable sparse vectors

#### 5. Visit the application:
Open your browser and go to `http://localhost:5173`

## Technologies Used

### Frontend:
- **React 18** with **TypeScript**
- **Vite** for fast development and building  
- **Tailwind CSS** for styling
- **React Query** for API state management
- **React Router** for navigation
- **Supabase** for authentication

### Backend:
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **OpenAI API** for embeddings and chat completions
- **Pinecone** for vector storage and hybrid search
- **Supabase** for authentication and document metadata
- **Multer** for file upload handling
- **PDF parsing** with custom extraction pipeline

### AI/ML Stack:
- **OpenAI text-embedding-3-large** for dense embeddings
- **Pinecone sparse vectors** for keyword matching
- **GPT-4o-mini** for answer generation
- **Custom hybrid search** combining semantic and lexical retrieval
- **Adaptive chunking** based on document size and structure

## Architecture Highlights

- **Hybrid RAG Pipeline:** Combines dense semantic search with sparse keyword matching for comprehensive legal document retrieval
- **Adaptive Processing:** Document chunking automatically adjusts based on document size to optimize context preservation
- **User Isolation:** Each user's documents are stored in separate Pinecone namespaces with Supabase RLS policies
- **Strict Answer Validation:** AI responses are validated to ensure they only contain information from uploaded documents
- **Professional Legal UI:** Interface designed specifically for legal professionals with proper citation formatting

## Demo

[Add demo video or screenshots here]

---

**Built for Legal Professionals** - Legal Probe combines the power of modern AI with the precision required for legal research, providing a reliable tool for document analysis that legal professionals can trust.