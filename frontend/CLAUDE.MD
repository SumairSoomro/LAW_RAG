 # CLAUDE.md — Legal RAG Frontend


 ## What this is


 Legal Probe is the name


 A React TypeScript frontend for the **Legal RAG chatbot** that interfaces with law school PDFs.
 Users upload PDFs, ask questions, and get strict answers with document citations.


 **Backend Integration**: Connects to Legal RAG API running on `http://localhost:3000`


 Stack:
 * **React 18** + **TypeScript** → Modern UI framework
 * **Vite** → Fast build tool and dev server
 * **Tailwind CSS** → Utility-first styling
 * **Supabase Auth** → User authentication
 * **React Query** → API state management and caching


 ---


 ## 1. Authentication Flow


 **Supabase Integration**:
 * Users must sign in before accessing the chat interface
 * Protected routes redirect unauthenticated users to login
 * Session persistence across browser refreshes
 * Clean logout functionality


 **Pages**:
 * `/login` → Login form with Supabase Auth
 * `/signup` → Registration form
 * `/` → Main dashboard (protected route)


 ---


 ## 2. Main Dashboard Layout


 **Two-Panel Design**:
 * **Left Panel**: Document Library
   * Upload new PDFs (drag & drop + file picker)
   * List of uploaded documents
   * File metadata (name, size, pages, upload date)
   * Upload progress indicators


 * **Right Panel**: Chat Interface
   * Clean message bubbles (user questions + AI answers)
   * Input field with send button
   * Document citations displayed clearly
   * Loading states and error handling


 ---


 ## 3. API Integration


 **Backend Endpoints**:
 * `POST /upload` → Upload PDF documents
 * `GET /documents` → Fetch user's document library
 * `POST /query` → Send questions and get RAG answers
 * Supabase Auth → Handle login/signup/logout


 **Authentication**:
 * Include Supabase JWT token in API requests
 * Handle 401 responses by redirecting to login


 ---


 ## 4. State Management


 **React Query** for:
 * Document uploads with progress tracking
 * Fetching document library
 * Chat queries with loading states
 * Error handling and retries


 **React State** for:
 * Current chat session messages (lost on refresh)
 * UI state (modals, loading indicators)
 * Form inputs


 ---


 ## 5. Key Features


 **Current Session Chat**:
 * Messages stored in React state during session
 * Lost on page refresh (inform user)
 * Clear, readable message formatting
 * Proper citation display with document names


 **Document Management**:
 * File upload with validation (PDF only, size limits)
 * Visual upload progress
 * Document library with search/filter
 * Responsive design for mobile/desktop


 **Error Handling**:
 * Network errors with retry options
 * File upload errors
 * Authentication errors
 * API response errors


 ---


 ## 6. Responsive Design


 **Desktop** (1024px+):
 * Two-panel side-by-side layout
 * Full document library visible
 * Expanded chat interface


 **Mobile** (768px-):
 * Stacked layout or tab navigation
 * Collapsible document panel
 * Touch-optimized chat input


 ---


 ## 7. Environment Variables


 VITE_SUPABASE_URL=your_supabase_url
 VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
 VITE_API_BASE_URL=http://localhost:3000


 ---


 ## 8. File Structure


 src/
 ├── components/
 │   ├── auth/           # Login/signup components
 │   ├── chat/           # Chat interface components
 │   ├── documents/      # Document upload/library components
 │   ├── layout/         # Header, sidebar, layout components
 │   └── ui/             # Reusable UI components
 ├── pages/              # Route components
 ├── hooks/              # Custom React hooks
 ├── services/           # API calls and Supabase client
 ├── types/              # TypeScript type definitions
 ├── utils/              # Helper functions
 └── styles/             # Global styles and Tailwind config


 ---


 ## 9. Development Workflow


 1. **Start Backend**: Ensure Legal RAG API is running on port 3000
 2. **Install Dependencies**: `npm install`
 3. **Environment Setup**: Configure `.env` with Supabase credentials
 4. **Dev Server**: `npm run dev`
 5. **Build**: `npm run build` for production


 ---


 ## 10. User Experience Flow


 1. **Landing** → Redirect to login if not authenticated
 2. **Login/Signup** → Supabase authentication
 3. **Dashboard** → Two-panel interface loads
 4. **Upload PDFs** → Documents stored in user's backend namespace
 5. **Ask Questions** → Real-time chat with citation display
 6. **Session Management** → Chat history persists until refresh


 ---


 Focus on clean, intuitive UX that makes legal document Q&A feel natural and trustworthy.
