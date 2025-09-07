import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthProvider } from './components/auth/AuthProvider';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Temporary dashboard component for testing
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-[#dad2bc] p-8 text-center">
        <h1 className="text-2xl font-bold text-[#252323] mb-4">Dashboard</h1>
        <p className="text-[#70798c]">Login successful! This is where the chat interface will go.</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;