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
  document: string;
  page?: number;
  section?: string;
  text?: string;
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