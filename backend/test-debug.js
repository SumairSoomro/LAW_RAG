// Debug script to test the parsing logic
const testCases = [
  "Not in the document.",
  "The contract states that...",
  "Based on the legal document, the answer is...",
  "not in the document"
];

testCases.forEach(answerText => {
  const foundInDocument = !answerText.toLowerCase().includes("not in the document");
  console.log(`Answer: "${answerText}"`);
  console.log(`foundInDocument: ${foundInDocument}`);
  console.log('---');
});