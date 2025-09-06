import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { AuthMiddleware, AuthenticatedRequest } from './auth/middleware';
import { PDFExtractor } from './chunking/pdf-extractor';
import { EmbeddingService } from './embedding/embeddings';
import { HybridSearchService } from './query/hybrid-search';
import { AnswerGeneratorService } from './answer/answer-generator';
import { defaultConfig } from './config/config';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const pdfExtractor = new PDFExtractor(
  defaultConfig.chunking.chunkSize,
  defaultConfig.chunking.chunkOverlap
);

const embeddingService = new EmbeddingService(
  process.env.OPENAI_API_KEY!,
  process.env.PINECONE_API_KEY!
);

const hybridSearchService = new HybridSearchService(embeddingService);

const answerGeneratorService = new AnswerGeneratorService(
  process.env.OPENAI_API_KEY!
);

// Initialize auth middleware
const authMiddleware = new AuthMiddleware(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload endpoint - Process PDF and store in vector database
app.post('/upload', 
  authMiddleware.authenticate,
  upload.single('pdf'),
  async (req, res): Promise<any> => {
    const authReq = req as AuthenticatedRequest;
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      const userId = authReq.user_id;
      const filePath = req.file.path;
      const originalFilename = req.file.originalname;

      console.log(`Processing PDF upload for user ${userId}: ${originalFilename}`);

      // Step 1: Extract and chunk PDF  
      const chunks = await pdfExtractor.processPDF(filePath, originalFilename);
      console.log(`Extracted ${chunks.length} chunks from PDF`);

      // Step 2: Generate embeddings for all chunks
      const embeddingBatch = await embeddingService.embedDocumentChunks(chunks);
      console.log(`Generated embeddings for ${embeddingBatch.embeddings.length} chunks`);

      // Step 3: Prepare records for Pinecone storage
      const records = embeddingBatch.embeddings.map((embedding, index) => ({
        id: `${originalFilename}:${chunks[index].metadata.pageNumber}:${chunks[index].metadata.chunkIndex}`,
        values: embedding.dense.values,
        sparseValues: {
          indices: embedding.sparse.indices,
          values: embedding.sparse.values
        },
        metadata: {
          ...chunks[index].metadata,
          text: chunks[index].text,
          userId: userId
        }
      }));

      // Step 4: Store vectors in Pinecone with user namespace
      await embeddingService.upsertToPinecone(
        process.env.PINECONE_INDEX_NAME!,
        userId, // Use user_id as namespace for isolation
        records
      );

      console.log(`Stored ${records.length} vectors in Pinecone namespace: ${userId}`);

      // Step 5: Store document metadata in Supabase
      const { data: documentRecord, error: dbError } = await authReq.supabase
        .from('documents')
        .insert({
          user_id: userId,
          original_filename: originalFilename,
          file_size: req.file.size,
          page_count: Math.max(...chunks.map(c => c.metadata.pageNumber)),
          chunk_count: chunks.length,
          storage_path: filePath,
          pinecone_namespace: userId
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ error: 'Failed to save document metadata' });
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        document: documentRecord,
        chunks_processed: chunks.length,
        total_tokens: embeddingBatch.totalTokens
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up uploaded file on error
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ 
        error: 'Failed to process PDF upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Query endpoint - Search documents and generate answers
app.post('/query',
  authMiddleware.authenticate,
  async (req, res): Promise<any> => {
    const authReq = req as AuthenticatedRequest;
    try {
      const { question } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required and must be a string' });
      }

      const userId = authReq.user_id;

      console.log(`Processing query for user ${userId}: ${question}`);

      // Step 1: Search for relevant chunks in user's namespace
      const searchResults = await hybridSearchService.searchRelevantChunks(
        question,
        process.env.PINECONE_INDEX_NAME!,
        userId // Use user_id as namespace for isolation
      );

      console.log(`Found ${searchResults.length} relevant chunks`);

      if (searchResults.length === 0) {
        return res.json({
          answer: "Not in the document.",
          sources: [],
          foundInDocument: false,
          searchResults: 0
        });
      }

      // Step 2: Generate answer using retrieved chunks
      const answerResponse = await answerGeneratorService.generateAnswer(
        question,
        searchResults
      );

      console.log(`Generated answer: ${answerResponse.foundInDocument ? 'Found' : 'Not found'}`);

      // Step 3: Return structured response
      res.json({
        ...answerResponse,
        searchResults: searchResults.length,
        query: question
      });

    } catch (error) {
      console.error('Query error:', error);
      res.status(500).json({ 
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// TEMPORARY: Test upload endpoint without authentication
app.post('/test-upload',
  upload.single('pdf'),
  async (req, res): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      // Use our test user ID
      const userId = '12345678-1234-1234-1234-123456789abc';
      const filePath = req.file.path;
      const originalFilename = req.file.originalname;

      console.log(`[TEST] Processing PDF upload for test user ${userId}: ${originalFilename}`);

      // Step 1: Extract and chunk PDF
      const chunks = await pdfExtractor.processPDF(filePath, originalFilename);
      console.log(`[TEST] Extracted ${chunks.length} chunks from PDF`);

      // Step 2: Generate embeddings for all chunks
      const embeddingBatch = await embeddingService.embedDocumentChunks(chunks);
      console.log(`[TEST] Generated embeddings for ${embeddingBatch.embeddings.length} chunks`);

      // Step 3: Prepare records for Pinecone storage
      const records = embeddingBatch.embeddings.map((embedding, index) => ({
        id: `${originalFilename}:${chunks[index].metadata.pageNumber}:${chunks[index].metadata.chunkIndex}`,
        values: embedding.dense.values,
        sparseValues: {
          indices: embedding.sparse.indices,
          values: embedding.sparse.values
        },
        metadata: {
          ...chunks[index].metadata,
          text: chunks[index].text,
          userId: userId
        }
      }));

      // Step 4: Store vectors in Pinecone with user namespace
      await embeddingService.upsertToPinecone(
        process.env.PINECONE_INDEX_NAME!,
        userId, // Use test user_id as namespace for isolation
        records
      );

      console.log(`[TEST] Stored ${records.length} vectors in Pinecone namespace: ${userId}`);

      // Step 5: Store document metadata in Supabase
      const supabase = authMiddleware['supabase'] || require('@supabase/supabase-js').createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_KEY!
      );
      
      const { data: documentRecord, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          original_filename: originalFilename,
          file_size: req.file.size,
          page_count: Math.max(...chunks.map(c => c.metadata.pageNumber)),
          chunk_count: chunks.length,
          storage_path: filePath,
          pinecone_namespace: userId
        })
        .select()
        .single();

      if (dbError) {
        console.error('[TEST] Database error:', dbError);
        return res.status(500).json({ error: 'Failed to save document metadata', details: dbError.message });
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'TEST UPLOAD SUCCESSFUL',
        document: documentRecord,
        chunks_processed: chunks.length,
        total_tokens: embeddingBatch.totalTokens,
        test_user_id: userId
      });

    } catch (error) {
      console.error('[TEST] Upload error:', error);
      
      // Clean up uploaded file on error
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ 
        error: 'Failed to process PDF upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// TEMPORARY: Test query endpoint without authentication  
app.post('/test-query',
  async (req, res): Promise<any> => {
    try {
      const { question } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required and must be a string' });
      }

      // Use our test user ID
      const userId = '12345678-1234-1234-1234-123456789abc';

      console.log(`[TEST] Processing query for test user ${userId}: ${question}`);

      // Step 1: Search for relevant chunks in user's namespace
      const searchResults = await hybridSearchService.searchRelevantChunks(
        question,
        process.env.PINECONE_INDEX_NAME!,
        userId // Use test user_id as namespace for isolation
      );

      console.log(`[TEST] Found ${searchResults.length} relevant chunks`);

      if (searchResults.length === 0) {
        return res.json({
          answer: "Not in the document.",
          sources: [],
          foundInDocument: false,
          searchResults: 0,
          test_user_id: userId
        });
      }

      // Step 2: Generate answer using retrieved chunks
      const answerResponse = await answerGeneratorService.generateAnswer(
        question,
        searchResults
      );

      console.log(`[TEST] Generated answer: ${answerResponse.foundInDocument ? 'Found' : 'Not found'}`);

      // Step 3: Return structured response
      res.json({
        ...answerResponse,
        searchResults: searchResults.length,
        query: question,
        test_user_id: userId,
        message: 'TEST QUERY SUCCESSFUL'
      });

    } catch (error) {
      console.error('[TEST] Query error:', error);
      res.status(500).json({ 
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get user's documents endpoint
app.get('/documents',
  authMiddleware.authenticate,
  async (req, res): Promise<any> => {
    const authReq = req as AuthenticatedRequest;
    try {
      const userId = authReq.user_id;

      const { data: documents, error } = await authReq.supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch documents' });
      }

      res.json({
        documents: documents || [],
        total: documents?.length || 0
      });

    } catch (error) {
      console.error('Documents fetch error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Error handling middleware
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Start server
app.listen(PORT, () => {
  console.log(`=� Legal RAG API server running on port ${PORT}`);
  console.log(`=� Ready to process legal documents and answer questions`);
});

export default app;