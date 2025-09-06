

# claude.md — Strict RAG Chatbot for Law PDFs

## What this is

A retrieval-augmented generation (RAG) chatbot for **law school PDFs (7–60 pages each)**.
It is **strict**: answers must come only from retrieved context, otherwise respond *“Not in the document.”*

Stack:

* **Supabase** → auth, storage, and database.
* **Pinecone** → hybrid vector search (dense + sparse).
* **OpenAI** → embeddings + Chat completions.
* **Custom PDFExtractor** → chunking pipeline (already implemented).

---

## 1. Chunking (with `PDFExtractor`)

We use the existing `PDFExtractor` class to process PDFs.

* **Input**: PDF file.
* **Output**: `DocumentChunk[]`, where each chunk has:

  * `text: string` → raw chunk text.
  * `metadata: ChunkMetadata` →

    * `documentName` (string)
    * `pageNumber` (number)
    * `sectionHeading` (string, if detected in top 5 lines)
    * `chunkIndex` (sequential index per page).

### Chunking strategy

* **Chunk size**: \~1000 tokens.
* **Overlap**: \~200 tokens.
* **Boundaries**: split per page, preserve section headings if detected.
* **Orphans**: very small remainders merged with previous chunk.

This guarantees legal arguments and rules don’t get split unnaturally.

---

## 2. Embedding

For each `DocumentChunk`:

* **Dense embedding**:

  * Model: OpenAI `text-embedding-3-large` (3072 dims).
  * Captures semantic meaning.

* **Sparse embedding**:

  * Model: Pinecone `pinecone-sparse-english-v0`.
  * Captures exact lexical matches (citations, section numbers, statutes).

---

## 3. Upsert into Pinecone

Each chunk is stored in Pinecone with:

* **Dense values** (OpenAI).
* **Sparse values** (Pinecone).
* **Metadata** = `{ documentName, pageNumber, sectionHeading, chunkIndex, text }`.

### Namespacing

* **Namespace = Supabase `user_id`**.
* Ensures strict user isolation (a user only queries their own documents).
* Vector IDs = `"{documentName}:{pageNumber}:{chunkIndex}"`.

---

## 4. Querying

When a user submits a question:

1. **Auth** → confirm `user_id` from Supabase.
2. **Generate embeddings**:

   * Dense via OpenAI.
   * Sparse via Pinecone.
3. **Hybrid search**:

   * Query Pinecone with both embeddings in **one call**.
   * Restrict to `namespace = user_id`.
   * Retrieve top\_k = 12–15 chunks.
4. **Select best**: choose top 5–8 unique chunks for context.

---

## 5. Answering

* Pass selected chunks into ChatGPT prompt:

  ```
  You are a strict legal assistant.
  Use ONLY the context below. If the answer is not in the context, say: "Not in the document."

  Context:
  [chunk 1: documentName, pageNumber, text]
  [chunk 2: ...]
  ...

  User question: "<query>"
  ```
* Output:

  * 1–3 sentence grounded answer (not necessary).
  * Cite (documentName, pageNumber) for each factual statement.
  * Refuse if unsupported.
  * A good RAG will answer correctly consistently and will give you an explanation of how it got to that answer. This is main goal

---

## 6. Data storage (Supabase)

* **documents** table → tracks file ownership and metadata.
* **storage** bucket → raw PDFs.
* Optionally: **chunks** table → to store extracted chunks (if not relying only on Pinecone metadata).
* Row Level Security: `user_id = auth.uid()`.

---

## 7. Accuracy strategy

* Hybrid search ensures:

  * **Dense** captures paraphrased questions.
  * **Sparse** captures exact citations (e.g. §12(b)(6)).
* With 7–60 page PDFs, the right chunk will almost always be in the top 10.
* Reranking not needed at this scale.

---

## 8. Deletion

On document delete:

* Remove file from Supabase storage.
* Delete vectors in Pinecone by `namespace=user_id` + `documentName`.
* Drop row in `documents` table.

---
Focus on deletion feature later

## 9. Environment variables

* `OPENAI_API_KEY`
* `PINECONE_API_KEY`
* `PINECONE_INDEX_HOST`
* `PINECONE_ENVIRONMENT`
* `SUPABASE_URL`
* `SUPABASE_SERVICE_ROLE_KEY` (server)

---

## ✅ Minimal flow

1. User uploads PDF → stored in Supabase.
2. Server uses `PDFExtractor.processPDF()` → `DocumentChunk[]`.
3. Generate embeddings → upsert into Pinecone (`namespace=user_id`).
4. User asks a question → embed query (dense + sparse).
5. Hybrid query Pinecone → return top chunks.
6. Send chunks to ChatGPT → strict answer or refusal.

---

