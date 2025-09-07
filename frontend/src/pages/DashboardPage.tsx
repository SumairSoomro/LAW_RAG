import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { ChatInterface } from '../components/chat/ChatInterface';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-[#dad2bc] p-8 text-center">
          <div className="w-8 h-8 border-2 border-[#252323] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#70798c]">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f5f1ed]">
      <Navbar />
      <ChatInterface />
    </div>
  );
};