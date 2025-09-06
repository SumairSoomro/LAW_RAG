require('dotenv').config();

async function testUpsert() {
  const { EmbeddingService } = require('./dist/embedding/embeddings');
  
  const legalTexts = [
    "The plaintiff filed a motion for summary judgment under Federal Rule of Civil Procedure 56, arguing that there are no genuine issues of material fact.",
    "Under the doctrine of promissory estoppel, a promise which the promisor should reasonably expect to induce action or forbearance on the part of the promisee.",
    "The court applied the reasonable person standard in determining whether the defendant's conduct constituted negligence under tort law."
  ];
  
  try {
    const embeddingService = new EmbeddingService(
      process.env.OPENAI_API_KEY,
      process.env.PINECONE_API_KEY
    );
    
    console.log('Generating hybrid embeddings for test texts...');
    
    const records = [];
    for (let i = 0; i < legalTexts.length; i++) {
      console.log(`Processing text ${i + 1}/${legalTexts.length}...`);
      
      const embedding = await embeddingService.generateHybridEmbedding(
        legalTexts[i],
        { 
          documentName: "test-legal-doc", 
          pageNumber: i + 1, 
          chunkIndex: 0,
          text: legalTexts[i]
        }
      );
      
      records.push({
        id: `test-legal-doc:${i + 1}:0`,
        values: embedding.dense.values,
        sparseValues: {
          indices: embedding.sparse.indices,
          values: embedding.sparse.values
        },
        metadata: {
          text: embedding.text,
          documentName: embedding.metadata.documentName,
          pageNumber: embedding.metadata.pageNumber,
          chunkIndex: embedding.metadata.chunkIndex
        }
      });
    }
    
    console.log(`\nUpserting ${records.length} hybrid vectors to Pinecone 'law' index...`);
    
    await embeddingService.upsertToPinecone(
      'law',
      'test-namespace',
      records
    );
    
    console.log('✅ Successfully upserted hybrid vectors to Pinecone!');
    console.log(`Upserted records with IDs: ${records.map(r => r.id).join(', ')}`);
    
    return records;
    
  } catch (error) {
    console.error('❌ Upsert test failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  testUpsert()
    .then(records => {
      console.log('\n🎉 Hybrid vector upsert test completed successfully!');
      console.log('Ready to test search functionality');
    })
    .catch(error => {
      console.error('Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testUpsert };