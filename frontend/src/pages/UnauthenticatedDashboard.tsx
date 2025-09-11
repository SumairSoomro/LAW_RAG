import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Scale, FileText, MessageSquare, Shield } from 'lucide-react';

export const UnauthenticatedDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-[#252323] rounded-2xl flex items-center justify-center">
                <Scale className="w-10 h-10 text-[#f5f1ed]" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#252323] mb-4">
              Legal Probe
            </h1>
            <p className="text-xl text-[#70798c] mb-8 max-w-2xl mx-auto">
              AI-powered legal document analysis. Upload PDFs, ask questions, and get precise answers with document citations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#252323] hover:bg-[#70798c] text-[#f5f1ed] px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-lg"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-white hover:bg-[#f5f1ed] text-[#252323] px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-lg border border-[#dad2bc]"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#dad2bc]">
              <div className="w-12 h-12 bg-[#f5f1ed] rounded-lg flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-6 h-6 text-[#252323]" />
              </div>
              <h3 className="text-lg font-semibold text-[#252323] mb-2">PDF Upload</h3>
              <p className="text-[#70798c] text-sm">
                Upload legal documents and contracts for instant AI analysis
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#dad2bc]">
              <div className="w-12 h-12 bg-[#f5f1ed] rounded-lg flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="w-6 h-6 text-[#252323]" />
              </div>
              <h3 className="text-lg font-semibold text-[#252323] mb-2">AI Q&A</h3>
              <p className="text-[#70798c] text-sm">
                Ask questions and get precise answers about your documents
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#dad2bc]">
              <div className="w-12 h-12 bg-[#f5f1ed] rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-[#252323]" />
              </div>
              <h3 className="text-lg font-semibold text-[#252323] mb-2">Source Citations</h3>
              <p className="text-[#70798c] text-sm">
                Every answer includes Document References 
              </p>
            </div>
          </div>

          {/* Demo Chat Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-[#dad2bc] p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-[#252323] mb-4">See Legal Probe in Action</h3>
            
            {/* Mock Chat Messages */}
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#f5f1ed] rounded-full flex items-center justify-center flex-shrink-0">
                  <Scale className="w-3 h-3 text-[#252323]" />
                </div>
                <div className="bg-[#f5f1ed] p-3 rounded-lg rounded-tl-none text-sm">
                  <p className="text-[#252323]">I've analyzed your contract. What would you like to know?</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-[#252323] text-[#f5f1ed] p-3 rounded-lg rounded-tr-none text-sm max-w-xs">
                  <p>What are the termination clauses?</p>
                </div>
                <div className="w-6 h-6 bg-[#70798c] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-white">U</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#f5f1ed] rounded-full flex items-center justify-center flex-shrink-0">
                  <Scale className="w-3 h-3 text-[#252323]" />
                </div>
                <div className="bg-[#f5f1ed] p-3 rounded-lg rounded-tl-none text-sm">
                  <p className="text-[#252323] mb-2">Section 8.2 allows termination with 30-day notice...</p>
                  <div className="text-xs text-[#70798c] bg-white px-2 py-1 rounded border-l-2 border-[#70798c]">
                    📄 Main Source: Contract.pdf
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#dad2bc]">
              <p className="text-[#70798c] text-sm text-center">
                Sign in to start analyzing your legal documents
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};