// Backend API Response Types

export interface UploadResponse {
  success: boolean;
  document: {
    id: string;
    user_id: string;
    original_filename: string;
    file_size: number;
    page_count: number;
    chunk_count: number;
    storage_path: string;
    pinecone_namespace: string;
    uploaded_at: string;
  };
  chunks_processed: number;
  total_tokens: number;
}

export interface QueryResponse {
  answer: string;
  sources: SourceReference[];
  foundInDocument: boolean;
  searchResults: number;
  query: string;
}

export interface SourceReference {
  documentName: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface Document {
  id: string;
  user_id: string;
  original_filename: string;
  file_size: number;
  page_count: number;
  chunk_count: number;
  storage_path: string;
  pinecone_namespace: string;
  uploaded_at: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

// Chat Session Types
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  type: 'user' | 'ai';
  content: string;
  sources?: SourceReference[];
  found_in_document?: boolean;
  search_results?: number;
  error?: boolean;
  created_at: string;
}

export interface CreateSessionResponse {
  session: ChatSession;
}

export interface SessionWithMessages {
  session: ChatSession;
  messages: ChatMessage[];
}