import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Bot, User, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { DocumentService } from '../../services/documentService';
import { ChatService } from '../../services/chatService';
import { QueryResponse, SourceReference } from '../../types/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: SourceReference[];
  foundInDocument?: boolean;
  searchResults?: number;
  error?: boolean;
}

export const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Welcome to Legal Probe! I'm your AI legal document assistant. Upload a PDF document using the paperclip icon below, then ask me questions about its contents. I'll provide precise answers with document citations.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ fileName: string; progress: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await ChatService.sendQuery(question);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
        foundInDocument: response.foundInDocument,
        searchResults: response.searchResults
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat query failed:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I encountered an error processing your question: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        error: true
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('File size must be less than 50MB.');
      return;
    }

    setUploadProgress({ fileName: file.name, progress: 0 });
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev) return null;
          const newProgress = Math.min(prev.progress + 15, 90);
          return { ...prev, progress: newProgress };
        });
      }, 300);

      const response = await DocumentService.uploadDocument(file);
      
      clearInterval(progressInterval);
      setUploadProgress({ fileName: file.name, progress: 100 });
      
      setTimeout(() => {
        setUploadProgress(null);
        
        const uploadMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `Great! I've successfully uploaded "${file.name}". You can now ask me questions about this document and I'll provide answers with specific citations.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, uploadMessage]);
      }, 1000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(null);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Failed to upload "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    // Clear the file input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatMessageContent = (content: string) => {
    // Convert **text** to <strong>text</strong>
    const boldFormatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return boldFormatted;
  };

  return (
    <div className="chat-container flex flex-col h-[calc(100vh-73px)]">
      {/* Messages Area */}
      <div className="messages-area flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.type} flex items-start gap-3 mb-6 ${
                message.type === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border shadow-sm flex-shrink-0">
                  <Bot className="w-4 h-4 text-[#252323]" />
                </div>
              )}
              
              <div className={`message-bubble ${message.type} ${
                message.type === 'user' 
                  ? 'bg-[#252323] text-[#f5f1ed]' 
                  : message.error
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : message.foundInDocument === false
                      ? 'bg-[#fff8f8] border border-[#fecaca] text-[#991b1b]'
                      : 'bg-white border border-[#dad2bc] text-[#252323]'
              } p-4 rounded-lg shadow-sm max-w-lg sm:max-w-2xl`}>
                <p 
                  className="whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                />
                
                {message.sources && message.sources.length > 0 ? (
                  <div className="source-info flex items-center gap-2 text-[#70798c] text-sm p-3 bg-[#f5f1ed] rounded border-l-4 border-[#70798c] mt-3">
                    {message.sources.length === 1 ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <div className="flex">
                        <FileText className="w-4 h-4" />
                        <FileText className="w-4 h-4 -ml-2" />
                      </div>
                    )}
                    <span>
                      <strong>Source{message.sources.length > 1 ? 's' : ''}:</strong> {message.sources.map(source => source.documentName).join(', ')}
                    </span>
                  </div>
                ) : message.foundInDocument === false ? (
                  <div className="source-info flex items-center gap-2 text-[#991b1b] text-sm p-3 bg-[#fef2f2] rounded border-l-4 border-[#ef4444] mt-3">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <span className="text-xs">🔍</span>
                    </div>
                    <span>
                      <strong>Searched:</strong> All uploaded documents
                    </span>
                  </div>
                ) : null}
                
                <div className={`text-xs mt-2 opacity-60 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-[#70798c] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="message ai flex items-start gap-3 mb-6">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border shadow-sm flex-shrink-0">
                <Bot className="w-4 h-4 text-[#252323]" />
              </div>
              <div className="message-bubble ai bg-white border border-[#dad2bc] p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-[#70798c]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#70798c] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#70798c] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#70798c] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">Legal Probe is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="input-area bg-white border-t border-[#dad2bc] p-4 shadow-lg">
        {/* Upload Progress */}
        {uploadProgress && (
          <div className="upload-progress mb-3 max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-sm text-[#70798c] mb-2">
              <span>Uploading: {uploadProgress.fileName}</span>
              <span>{uploadProgress.progress}%</span>
            </div>
            <div className="progress-bar bg-[#dad2bc] rounded-full h-2">
              <div 
                className="progress-fill bg-[#a99985] h-full rounded-full transition-all duration-200" 
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage}>
          <div className="input-container flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
            {/* Upload Button */}
            <button
              type="button"
              onClick={handleUploadClick}
              className="upload-btn bg-[#dad2bc] hover:bg-[#a99985] text-[#252323] p-2 sm:p-3 rounded-lg transition-colors duration-200 shadow-md flex-shrink-0"
              title="Upload PDF"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Message Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="message-input w-full bg-white border border-[#dad2bc] px-3 sm:px-4 py-2 sm:py-3 pr-12 sm:pr-16 rounded-lg text-[#252323] placeholder-[#70798c] focus:outline-none focus:border-[#70798c] focus:shadow-lg transition-all duration-200"
                placeholder={user ? "Ask a question about your document..." : "Please sign in to start chatting..."}
                disabled={!user || isLoading}
              />

              {/* Send Button - positioned inside input */}
              <button
                type="submit"
                disabled={!user || !inputMessage.trim() || isLoading}
                className="send-btn absolute right-2 top-1/2 -translate-y-1/2 overflow-hidden bg-[#252323] hover:bg-[#70798c] text-[#f5f1ed] p-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg font-medium transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};