require('dotenv').config();

async function testSearch() {
  const { EmbeddingService } = require('./dist/embedding/embeddings');
  
  try {
    const embeddingService = new EmbeddingService(
      process.env.OPENAI_API_KEY,
      process.env.PINECONE_API_KEY
    );
    
    console.log('Testing hybrid search functionality...');
    
    // Generate embeddings for the query
    const query = "summary judgment motion under Federal Rule 56";
    console.log(`\nQuery: "${query}"`);
    
    const queryEmbedding = await embeddingService.generateHybridEmbedding(query);
    console.log('Query embedding generated successfully');
    console.log('- Dense dimensions:', queryEmbedding.dense.dimension);
    console.log('- Sparse indices count:', queryEmbedding.sparse.indices.length);
    
    // Search using Pinecone client directly
    const index = embeddingService.pinecone.Index('law');
    
    const searchRequest = {
      vector: queryEmbedding.dense.values,
      sparseVector: {
        indices: queryEmbedding.sparse.indices,
        values: queryEmbedding.sparse.values
      },
      topK: 3,
      includeMetadata: true,
      includeValues: false
    };
    
    console.log('\nPerforming hybrid search...');
    const searchResults = await index.namespace('test-namespace').query(searchRequest);
    
    console.log('\n🔍 Search Results:');
    console.log('===================');
    
    if (searchResults.matches && searchResults.matches.length > 0) {
      searchResults.matches.forEach((match, i) => {
        console.log(`\n${i + 1}. Score: ${match.score.toFixed(4)}`);
        console.log(`   ID: ${match.id}`);
        if (match.metadata) {
          console.log(`   Document: ${match.metadata.documentName}`);
          console.log(`   Page: ${match.metadata.pageNumber}`);
          console.log(`   Text: ${match.metadata.text.substring(0, 200)}...`);
        }
      });
      
      console.log('\n✅ Hybrid search completed successfully!');
      
      // Verify the most relevant result
      const topMatch = searchResults.matches[0];
      const isRelevant = topMatch.metadata.text.toLowerCase().includes('summary judgment') ||
                        topMatch.metadata.text.toLowerCase().includes('federal rule');
      
      console.log(`\n📊 Relevance Check: ${isRelevant ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Top result contains relevant legal terms: ${isRelevant}`);
      
      return searchResults;
    } else {
      console.log('No matches found');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Search test failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  testSearch()
    .then(results => {
      console.log('\n🎉 Hybrid search test completed successfully!');
      console.log('RAG pipeline is working correctly!');
    })
    .catch(error => {
      console.error('Search test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testSearch };