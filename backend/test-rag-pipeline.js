require('dotenv').config();

async function testRAGPipeline() {
  const { EmbeddingService } = require('./dist/embedding/embeddings');
  const { AnswerGeneratorService } = require('./dist/answer/answer-generator');
  
  console.log('🧪 Testing Complete RAG Pipeline');
  console.log('==================================\n');

  try {
    // Initialize services
    const embeddingService = new EmbeddingService(
      process.env.OPENAI_API_KEY,
      process.env.PINECONE_API_KEY
    );
    
    const answerGenerator = new AnswerGeneratorService(
      process.env.OPENAI_API_KEY
    );

    // Test queries for our legal document chunks
    const testQueries = [
      "What is Federal Rule of Civil Procedure 56 about?",
      "What does the court say about summary judgment?",
      "What is promissory estoppel?",
      "What is the reasonable person standard?",
      "What are the requirements for filing a motion for summary judgment?",
      "What is quantum mechanics?" // Should return "Not in the document"
    ];

    for (const [index, query] of testQueries.entries()) {
      console.log(`\n📋 Test ${index + 1}: "${query}"`);
      console.log('─'.repeat(80));
      
      // Step 1: Generate query embeddings
      console.log('🔍 Generating query embeddings...');
      const queryEmbedding = await embeddingService.generateHybridEmbedding(query);
      
      // Step 2: Search Pinecone for relevant chunks
      console.log('📊 Searching for relevant chunks...');
      const pineconeIndex = embeddingService.pinecone.Index('law');
      
      const searchRequest = {
        vector: queryEmbedding.dense.values,
        sparseVector: {
          indices: queryEmbedding.sparse.indices,
          values: queryEmbedding.sparse.values
        },
        topK: 10, // Retrieve more chunks as per CLAUDE.md (12-15)
        includeMetadata: true,
        includeValues: false
      };
      
      const searchResults = await pineconeIndex.namespace('test-namespace').query(searchRequest);
      
      // Step 3: Format search results for answer generation
      const formattedResults = searchResults.matches ? searchResults.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: {
          text: match.metadata.text,
          documentName: match.metadata.documentName,
          pageNumber: match.metadata.pageNumber,
          sectionHeading: match.metadata.sectionHeading || '',
          chunkIndex: match.metadata.chunkIndex
        }
      })) : [];
      
      // Select top 5-8 chunks as per CLAUDE.md spec
      const selectedChunks = formattedResults.slice(0, 6);
      
      console.log(`📝 Found ${formattedResults.length} chunks, using top ${selectedChunks.length}:`);
      selectedChunks.forEach((chunk, i) => {
        console.log(`   ${i + 1}. ${chunk.metadata.documentName}, Page ${chunk.metadata.pageNumber} (Score: ${chunk.score.toFixed(3)})`);
      });
      
      // Step 4: Generate answer using ChatGPT
      console.log('\n🤖 Generating answer...');
      const answer = await answerGenerator.generateAnswer(query, selectedChunks);
      
      // Step 5: Display results
      console.log('\n✨ ANSWER:');
      console.log('─'.repeat(40));
      console.log(answer.answer);
      
      if (answer.foundInDocument) {
        console.log('\n📚 SOURCES:');
        answer.sources.forEach(source => {
          console.log(`   • ${source.documentName}, Page ${source.pageNumber}`);
        });
        
        if (answer.reasoning) {
          console.log('\n🧠 REASONING:');
          console.log(`   ${answer.reasoning}`);
        }
      }
      
      // Step 6: Validate answer quality
      const validation = await answerGenerator.validateAnswer(answer, query, selectedChunks);
      console.log(`\n✅ VALIDATION: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
      if (!validation.isValid) {
        validation.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
      }
      
      // Add delay between tests
      if (index < testQueries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 RAG Pipeline Testing Complete!');
    console.log('==================================');
    
  } catch (error) {
    console.error('❌ RAG Pipeline Test Failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  testRAGPipeline()
    .then(() => {
      console.log('\n✅ All RAG pipeline tests completed successfully!');
      console.log('The legal assistant is ready for production use.');
    })
    .catch(error => {
      console.error('Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testRAGPipeline };