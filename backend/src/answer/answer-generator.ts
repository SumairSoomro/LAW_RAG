import OpenAI from 'openai';

export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    text: string;
    documentName: string;
    pageNumber: number;
    sectionHeading?: string;
    chunkIndex: number;
  };
}

export interface AnswerResponse {
  answer: string;
  sources: Array<{
    documentName: string;
  }>;
  reasoning?: string;
  foundInDocument: boolean;
}

export class AnswerGeneratorService {
  private openai: OpenAI;

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({
      apiKey: openaiApiKey
    });
  }

  async generateAnswer(
    query: string, 
    searchResults: SearchResult[]
  ): Promise<AnswerResponse> {
    try {
      if (!searchResults || searchResults.length === 0) {
        return {
          answer: "Not in the document.",
          sources: [],
          foundInDocument: false
        };
      }

      const contextChunks = this.formatChunksForPrompt(searchResults);
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(query, contextChunks);
      
      // Original GPT-4o-mini configuration (commented out for GPT-5-nano testing)
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
         ],
         temperature: 0.1,
         max_completion_tokens: 1000
       });
      
      

      // GPT-5-nano configuration (no temperature parameter supported)


      /*
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 1000
      });
      */
      
    

      const answerText = response.choices[0]?.message?.content || "Not in the document.";
      
      return this.parseAnswer(answerText, searchResults);

    } catch (error) {
      throw new Error(`Failed to generate answer: ${error}`);
    }
  }

  private formatChunksForPrompt(searchResults: SearchResult[]): string {
    return searchResults
      .map((result, index) => {
        const chunk = result.metadata;
        return `[Source ${index + 1}: ${chunk.documentName}${chunk.sectionHeading ? `, Section: ${chunk.sectionHeading}` : ''}]\n${chunk.text}\n`;
      })
      .join('\n');
  }

  private buildSystemPrompt(): string {
    return `You are a strict legal assistant for law students and professionals. Your role is to provide accurate answers based ONLY on the provided context from legal documents.

    CRITICAL RULES:
    1. Use ONLY the context provided below. Never use external knowledge.
    2. If the answer is not in the context, respond exactly: "Not in the document."
    3. Provide a clear explanation of your reasoning process.
    4. Be precise with legal terminology and citations.
    5. If information is partially in the document but incomplete, say what you can find and note what's missing.
    6. NEVER refer to "chunks" or "sources" by number in your response (e.g., don't say "Chunk 1", "Source 1", "Document 1", or any numbered references).

    RESPONSE FORMAT:
    - Give a direct answer to the question
    - Explain your reasoning based on the document content, not source numbers
    - If uncertain or information is missing, be explicit about limitations
    - Focus on the legal content, not the internal organization of the context`;
  }

  private buildUserPrompt(query: string, contextChunks: string): string {
    return `Context from legal documents: ${contextChunks} User question: ${query} Please answer the question using only the provided context. Remember to cite sources and explain your reasoning.`;
  }

  private parseAnswer(answerText: string, searchResults: SearchResult[]): AnswerResponse {
    const foundInDocument = !answerText.toLowerCase().includes("not in the document");
    
    const sources = this.extractSources(searchResults);
    
    const reasoningMatch = answerText.match(/(?:reasoning|explanation|because|since|this is based on)[\s:.]+(.*?)(?:\n\n|$)/is);
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : undefined;

    const response: AnswerResponse = {
      answer: answerText,
      sources,
      foundInDocument
    };

    if (reasoning) {
      response.reasoning = reasoning;
    }

    return response;
  }

  private extractSources( searchResults: SearchResult[]): Array<{ documentName: string }> {
    /*
    const sources: Array<{ documentName: string }> = [];
    const seenSources = new Set<string>();
  

    searchResults.forEach(result => {
      const docName = result.metadata.documentName;
      const sourceKey = `${docName}`;
      
      // Only look for document name
      if (answerText.includes(docName) || answerText.includes(docName.replace('.pdf', ''))) {
        if (!seenSources.has(sourceKey)) {
          sources.push({
            documentName: docName
          });
          seenSources.add(sourceKey);
        }
      }
    });
    return sources;
    

    if (searchResults.length === 0) {
      return [];
    }
    const uniqueDocuments = new Set<string>();
    
    searchResults.forEach(result => {
      uniqueDocuments.add(result.metadata.documentName);
    });
  
    return Array.from(uniqueDocuments).map(docName => ({
      documentName: docName
    }));
    */
    const highestScoringChunk = searchResults[0];
  
    return [{ documentName: highestScoringChunk.metadata.documentName }];
  

  }

  async validateAnswer(
    answer: AnswerResponse,
    _originalQuery: string,
    _searchResults: SearchResult[]
  ): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    if (answer.foundInDocument && answer.sources.length === 0) {
      issues.push("Answer claims to be in document but provides no sources");
    }

    if (!answer.foundInDocument && answer.answer !== "Not in the document.") {
      issues.push("Answer should be exactly 'Not in the document.' when information not found");
    }

    if (answer.foundInDocument && !answer.reasoning) {
      issues.push("Answer should include reasoning/explanation");
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}