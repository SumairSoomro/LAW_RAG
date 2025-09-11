import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft, Mail, Shield, Database, Eye, Lock } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#f5f1ed]/80">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#dad2bc]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#252323] rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#f5f1ed]" />
              </div>
              <h1 className="text-xl font-semibold text-[#252323]">Legal Probe</h1>
            </div>
            <Link 
              to="/"
              className="flex items-center gap-2 text-[#70798c] hover:text-[#252323] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#252323] mb-2">Privacy Policy</h1>
            <p className="text-[#70798c]">Effective Date: September 11, 2025</p>
            <p className="text-[#70798c]">Last Updated: September 11, 2025</p>
          </div>

          {/* Privacy Overview */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-blue-800 font-semibold mb-1">Your Privacy Matters</h3>
                <p className="text-blue-700">
                  Legal Probe is committed to protecting your privacy and handling your data responsibly. 
                  This policy explains what information we collect, how we use it, and your rights regarding your data.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                1. Information We Collect
              </h2>
              <div className="space-y-4">
                
                <div className="border-l-4 border-[#dad2bc] pl-4">
                  <h3 className="font-semibold text-[#252323] mb-2">Account Information</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-[#70798c]">
                    <li>Email address (for account creation and authentication)</li>
                    <li>Password (encrypted and stored securely via Supabase)</li>
                    <li>Account creation and last login timestamps</li>
                    <li>User preferences and settings</li>
                  </ul>
                </div>

                <div className="border-l-4 border-[#dad2bc] pl-4">
                  <h3 className="font-semibold text-[#252323] mb-2">Document Data</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-[#70798c]">
                    <li>PDF documents you upload for analysis</li>
                    <li>Document metadata (filename, file size, page count)</li>
                    <li>Processed document chunks and embeddings (for AI analysis)</li>
                    <li>Upload timestamps and processing status</li>
                  </ul>
                </div>

                <div className="border-l-4 border-[#dad2bc] pl-4">
                  <h3 className="font-semibold text-[#252323] mb-2">Chat and Interaction Data</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-[#70798c]">
                    <li>All chat messages (your questions and AI responses)</li>
                    <li>Message timestamps and conversation threads</li>
                    <li>Source citations and document references</li>
                    <li>Chat session information and continuity data</li>
                  </ul>
                </div>

                <div className="border-l-4 border-[#dad2bc] pl-4">
                  <h3 className="font-semibold text-[#252323] mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-[#70798c]">
                    <li>IP address and browser information (for security and analytics)</li>
                    <li>Device type and operating system (for compatibility)</li>
                    <li>Usage patterns and feature interactions (for improvement)</li>
                    <li>Error logs and performance metrics (for debugging)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. How We Use Your Information */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                2. How We Use Your Information
              </h2>
              <div className="space-y-3 text-[#70798c]">
                <p>We use your information to:</p>
                
                <div className="bg-[#f5f1ed] p-4 rounded border space-y-3">
                  <div>
                    <h4 className="font-semibold text-[#252323]">Provide Core Services</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Process and analyze your uploaded documents</li>
                      <li>Generate AI responses to your questions</li>
                      <li>Maintain chat history and session continuity</li>
                      <li>Provide document citations and source references</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#252323]">Account Management</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Authenticate your identity and maintain login sessions</li>
                      <li>Enable cross-device access to your data</li>
                      <li>Provide customer support when requested</li>
                      <li>Send important service updates and notifications</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#252323]">Service Improvement</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Analyze usage patterns to improve AI accuracy</li>
                      <li>Identify and fix bugs and performance issues</li>
                      <li>Develop new features based on user needs</li>
                      <li>Enhance security and prevent abuse</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Data Storage and Security */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                3. Data Storage and Security
              </h2>
              <div className="space-y-4">
                
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Security Measures</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-green-700">
                    <li><strong>Encryption:</strong> All data transmitted and stored is encrypted</li>
                    <li><strong>Authentication:</strong> Secure login via Supabase with industry-standard practices</li>
                    <li><strong>Access Control:</strong> Row-level security ensures you only see your own data</li>
                    <li><strong>Infrastructure:</strong> Hosted on secure cloud platforms (Supabase, Pinecone)</li>
                  </ul>
                </div>

                <div className="space-y-3 text-[#70798c]">
                  <h3 className="font-semibold text-[#252323]">Where Your Data is Stored</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded p-4">
                      <h4 className="font-semibold text-[#252323] mb-2">Supabase (Primary Database)</h4>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                        <li>User accounts and authentication</li>
                        <li>Chat messages and sessions</li>
                        <li>Document metadata</li>
                        <li>User preferences</li>
                      </ul>
                    </div>
                    <div className="border rounded p-4">
                      <h4 className="font-semibold text-[#252323] mb-2">Pinecone (Vector Database)</h4>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                        <li>Document embeddings for AI search</li>
                        <li>Processed document chunks</li>
                        <li>Similarity search indices</li>
                        <li>AI model optimization data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">Data Persistence</h3>
                  <p className="text-amber-700">
                    Your data persists across browser sessions and devices to provide a seamless experience. 
                    Chat history and uploaded documents remain available until you choose to delete them or 
                    close your account.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Data Sharing and Third Parties */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">4. Data Sharing and Third-Party Services</h2>
              <div className="space-y-4">
                
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">We Do NOT Sell Your Data</h3>
                  <p className="text-red-700">
                    Legal Probe does not sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                </div>

                <div className="space-y-3 text-[#70798c]">
                  <h3 className="font-semibold text-[#252323]">Third-Party Services We Use</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-semibold">Supabase (Authentication & Database)</h4>
                      <p className="text-sm">Handles secure authentication and primary data storage with enterprise-grade security.</p>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-semibold">Pinecone (Vector Database)</h4>
                      <p className="text-sm">Stores document embeddings and enables AI-powered document search and analysis.</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-semibold">OpenAI (AI Processing)</h4>
                      <p className="text-sm">Processes your questions and documents to generate AI responses. Subject to OpenAI's privacy policy.</p>
                    </div>
                  </div>
                  
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    <strong>Note:</strong> These services may have access to your data as necessary to provide functionality, 
                    but they are bound by their own privacy policies and our data processing agreements.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Your Rights and Controls */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">5. Your Rights and Data Controls</h2>
              <div className="space-y-4">
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded p-4">
                    <h3 className="font-semibold text-[#252323] mb-2">Access Your Data</h3>
                    <p className="text-[#70798c] text-sm mb-2">
                      View all your chat history, uploaded documents, and account information through the dashboard.
                    </p>
                  </div>
                  <div className="border rounded p-4">
                    <h3 className="font-semibold text-[#252323] mb-2">Data Management</h3>
                    <p className="text-[#70798c] text-sm mb-2">
                      Individual document and chat deletion features are planned. Contact us for data management requests.
                    </p>
                  </div>
                  <div className="border rounded p-4">
                    <h3 className="font-semibold text-[#252323] mb-2">Export Your Data</h3>
                    <p className="text-[#70798c] text-sm mb-2">
                      Data export functionality is planned for future implementation. Contact us for current data requests.
                    </p>
                  </div>
                  <div className="border rounded p-4">
                    <h3 className="font-semibold text-[#252323] mb-2">Correct Your Data</h3>
                    <p className="text-[#70798c] text-sm mb-2">
                      Account management features are in development. Contact us for account information updates.
                    </p>
                  </div>
                </div>

                <div className="bg-[#f5f1ed] p-4 rounded border">
                  <h3 className="font-semibold text-[#252323] mb-2">Data Retention</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-[#70798c]">
                    <li>Your data remains accessible as long as your account is active</li>
                    <li>Data deletion features are planned for future implementation</li>
                    <li>Contact us at sumairsoomro@umass.edu for specific data retention requests</li>
                    <li>Some anonymized analytics data may be retained for service improvement</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. Cookies and Tracking */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">6. Cookies and Tracking</h2>
              <div className="space-y-3 text-[#70798c]">
                <p>Legal Probe uses minimal cookies and tracking:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Authentication Cookies:</strong> To keep you logged in across sessions</li>
                  <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
                  <li><strong>Security Cookies:</strong> To protect against fraud and abuse</li>
                  <li><strong>No Advertising Cookies:</strong> We do not use cookies for advertising or marketing tracking</li>
                </ul>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  You can disable cookies in your browser, but this may limit functionality of the service.
                </p>
              </div>
            </section>

            {/* 7. Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">7. Children's Privacy</h2>
              <p className="text-[#70798c] leading-relaxed">
                Legal Probe is not intended for users under 18 years of age. We do not knowingly collect personal 
                information from children under 18. If you believe a child has provided us with personal information, 
                please contact us immediately so we can delete such information.
              </p>
            </section>

            {/* 8. Changes to Privacy Policy */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">8. Changes to This Privacy Policy</h2>
              <p className="text-[#70798c] leading-relaxed">
                As Legal Probe evolves during development, this privacy policy may be updated to reflect new features, 
                legal requirements, or operational changes. We will notify you of significant changes via email or 
                in-app notifications before they take effect.
              </p>
            </section>

            {/* 9. Contact and Data Requests */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">9. Contact Us</h2>
              <div className="bg-[#f5f1ed] p-4 rounded border">
                <p className="text-[#252323] mb-4">
                  For privacy questions, data requests, or concerns about this policy:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#70798c]">
                    <Mail className="w-4 h-4" />
                    <span>Email:</span>
                    <a 
                      href="mailto:sumairsoomro@umass.edu" 
                      className="font-medium hover:text-[#252323] transition-colors"
                    >
                      sumairsoomro@umass.edu
                    </a>
                  </div>
                  <p className="text-sm text-[#70798c]">
                    <strong>Response Time:</strong> We aim to respond to privacy inquiries within 5-10 business days.
                  </p>
                </div>
              </div>
            </section>

            {/* Development Notice */}
            <section className="border-t pt-8">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-blue-800 font-semibold mb-1">Development Phase Privacy</h3>
                    <p className="text-blue-700 text-sm">
                      During active development, our privacy practices may evolve. We are committed to maintaining 
                      high privacy standards and will communicate any changes that affect how we handle your data. 
                      Your feedback on privacy concerns helps us build a more secure platform.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};