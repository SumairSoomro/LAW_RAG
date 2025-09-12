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
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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



      // Step 1: Extract and chunk PDF  
      const chunks = await pdfExtractor.processPDF(filePath, originalFilename);


      // Step 2: Generate embeddings for all chunks
      const embeddingBatch = await embeddingService.embedDocumentChunks(chunks);


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
        error: 'Failed to process PDF upload'
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

      

      // Step 1: Search for relevant chunks in user's namespace
      const searchResults = await hybridSearchService.searchRelevantChunks(
        question,
        process.env.PINECONE_INDEX_NAME!,
        userId // Use user_id as namespace for isolation
      );

  

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


      // Step 3: Return structured response
      res.json({
        ...answerResponse,
        searchResults: searchResults.length,
        query: question
      });

    } catch (error) {
      console.error('Query error:', error);
      res.status(500).json({ 
        error: 'Failed to process query'
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
        error: 'Failed to fetch documents'
      });
    }
  }
);

// Error handling middleware
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error'
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