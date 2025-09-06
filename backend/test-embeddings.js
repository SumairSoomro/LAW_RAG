// Simple test script to generate embeddings using our service
require('dotenv').config();

async function testEmbeddings() {
  // Import our embedding service (we'll use require since this is a quick test)
  const { EmbeddingService } = require('./dist/embedding/embeddings');
  
  // Sample legal text chunks (typical of what PDFExtractor would produce)
  const legalTexts = [
    "The plaintiff filed a motion for summary judgment under Federal Rule of Civil Procedure 56, arguing that there are no genuine issues of material fact.",
    "Under the doctrine of promissory estoppel, a promise which the promisor should reasonably expect to induce action or forbearance on the part of the promisee.",
    "The court applied the reasonable person standard in determining whether the defendant's conduct constituted negligence under tort law."
  ];
  
  try {
    // Initialize the embedding service with environment variables
    const embeddingService = new EmbeddingService(
      process.env.OPENAI_API_KEY,
      process.env.PINECONE_API_KEY
    );
    
    console.log('Testing embedding service...');
    
    // Test generating dense embedding first
    console.log('Testing dense embedding...');
    const denseEmbedding = await embeddingService.generateDenseEmbedding(legalTexts[0]);
    console.log('Dense embedding works:', denseEmbedding.dimension, 'dimensions');
    
    // Test sparse embedding separately to debug
    console.log('\nTesting sparse embedding...');
    try {
      const sparseEmbedding = await embeddingService.generateSparseEmbedding(legalTexts[0]);
      console.log('Sparse embedding:', sparseEmbedding);
    } catch (error) {
      console.error('Sparse embedding failed:', error.message);
      // For now, let's create a dummy sparse embedding for testing
      const dummySparse = { indices: [1, 5, 10], values: [0.5, 0.3, 0.2] };
      console.log('Using dummy sparse embedding for testing');
    }
    
    // Test generating a single hybrid embedding
    const singleEmbedding = await embeddingService.generateHybridEmbedding(
      legalTexts[0],
      { documentName: "test-doc", pageNumber: 1, chunkIndex: 0 }
    );
    
    console.log('Single embedding generated:');
    console.log('- Dense dimension:', singleEmbedding.dense.dimension);
    console.log('- Dense values sample:', singleEmbedding.dense.values.slice(0, 5));
    console.log('- Sparse embedding structure:', JSON.stringify(singleEmbedding.sparse, null, 2));
    console.log('- Sparse indices count:', singleEmbedding.sparse?.indices?.length || 'undefined');
    console.log('- Sparse values count:', singleEmbedding.sparse?.values?.length || 'undefined');
    
    // Format for Pinecone upsert (what we need for MCP)
    const recordForPinecone = {
      id: "test-doc:1:0",
      values: singleEmbedding.dense.values,
      sparse_values: {
        indices: singleEmbedding.sparse.indices,
        values: singleEmbedding.sparse.values
      },
      metadata: {
        text: singleEmbedding.text,
        documentName: singleEmbedding.metadata.documentName,
        pageNumber: singleEmbedding.metadata.pageNumber,
        chunkIndex: singleEmbedding.metadata.chunkIndex
      }
    };
    
    console.log('\nRecord formatted for Pinecone:');
    console.log(JSON.stringify({
      id: recordForPinecone.id,
      denseValuesCount: recordForPinecone.values.length,
      sparseIndicesCount: recordForPinecone.sparse_values.indices.length,
      metadata: recordForPinecone.metadata
    }, null, 2));
    
    // Return the record for MCP upsert
    return recordForPinecone;
    
  } catch (error) {
    console.error('Error testing embeddings:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testEmbeddings()
    .then(record => {
      console.log('\n✅ Embedding service test completed successfully!');
      console.log('Ready to upsert with MCP tools');
    })
    .catch(error => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testEmbeddings };