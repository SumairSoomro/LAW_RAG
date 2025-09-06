require('dotenv').config();

async function testCitationFix() {
  const { EmbeddingService } = require('./dist/embedding/embeddings');
  const { AnswerGeneratorService } = require('./dist/answer/answer-generator');
  const { HybridSearchService } = require('./dist/query/hybrid-search');
  
  console.log('🔧 Testing Citation Format Fix');
  console.log('===============================\n');

  try {
    const embeddingService = new EmbeddingService(
      process.env.OPENAI_API_KEY,
      process.env.PINECONE_API_KEY
    );
    
    const hybridSearch = new HybridSearchService(embeddingService);
    const answerGenerator = new AnswerGeneratorService(process.env.OPENAI_API_KEY);

    const testQuery = "What is Federal Rule of Civil Procedure 56 about?";
    
    console.log(`🧪 Test Query: "${testQuery}"\n`);

    // Get search results
    const searchResults = await hybridSearch.searchRelevantChunks(
      testQuery,
      'law',
      'test-namespace',
      { topK: 10, finalChunkCount: 6, similarityThreshold: 0.85 }
    );
    
    console.log('📊 Search Results:');
    searchResults.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.metadata.documentName}, Page ${result.metadata.pageNumber} (Score: ${result.score.toFixed(3)})`);
    });

    // Generate answer with fixed prompt
    console.log('\n🤖 Generating answer with improved citation format...\n');
    
    const answer = await answerGenerator.generateAnswer(testQuery, searchResults);
    
    console.log('✨ IMPROVED ANSWER:');
    console.log('─'.repeat(50));
    console.log(answer.answer);
    
    // Check for citation issues
    console.log('\n🔍 CITATION ANALYSIS:');
    console.log('─'.repeat(30));
    
    const hasChunkReferences = answer.answer.toLowerCase().includes('chunk');
    const hasSourceReferences = answer.answer.toLowerCase().includes('source 1') || answer.answer.toLowerCase().includes('source 2');
    const hasProperCitations = answer.answer.includes('(test-legal-doc, Page');
    
    console.log(`❌ Contains "chunk" references: ${hasChunkReferences ? 'YES (BAD)' : 'NO (GOOD)'}`);
    console.log(`❌ Contains "source X" references: ${hasSourceReferences ? 'YES (BAD)' : 'NO (GOOD)'}`);
    console.log(`✅ Contains proper citations: ${hasProperCitations ? 'YES (GOOD)' : 'NO (BAD)'}`);
    
    if (answer.foundInDocument) {
      console.log('\n📚 EXTRACTED SOURCES:');
      answer.sources.forEach(source => {
        console.log(`   • ${source.documentName}, Page ${source.pageNumber}`);
      });
    }
    
    // Overall assessment
    const isFixed = !hasChunkReferences && !hasSourceReferences && hasProperCitations;
    console.log(`\n🎯 CITATION FIX STATUS: ${isFixed ? '✅ FIXED' : '❌ NEEDS MORE WORK'}`);
    
    if (isFixed) {
      console.log('\n🎉 SUCCESS! The answer now uses proper legal citations without internal references.');
    } else {
      console.log('\n⚠️  The prompt may need further refinement to eliminate internal references.');
    }
    
  } catch (error) {
    console.error('❌ Citation Fix Test Failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  testCitationFix()
    .then(() => {
      console.log('\n✅ Citation format test completed!');
    })
    .catch(error => {
      console.error('Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testCitationFix };