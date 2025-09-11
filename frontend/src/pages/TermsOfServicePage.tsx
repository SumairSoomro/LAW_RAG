import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-[#252323] mb-2">Terms of Service</h1>
            <p className="text-[#70798c]">Effective Date: September 11, 2025</p>
            <p className="text-[#70798c]">Last Updated: September 11, 2025</p>
          </div>

          {/* Development Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-amber-800 font-semibold mb-1">Development Notice</h3>
                <p className="text-amber-700">
                  Legal Probe is currently in active development. Features may be incomplete, unstable, or subject to change. 
                  We appreciate your patience as we continue to improve the platform.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">1. Acceptance of Terms</h2>
              <p className="text-[#70798c] leading-relaxed">
                By accessing and using Legal Probe ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* 2. Service Description */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">2. Service Description</h2>
              <div className="space-y-3 text-[#70798c]">
                <p>Legal Probe is an AI-powered legal document assistant that provides:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Document upload and analysis capabilities</li>
                  <li>Question-answering based on uploaded legal documents</li>
                  <li>Citation and source referencing</li>
                  <li>Chat-based interaction with document content</li>
                </ul>
                <p className="bg-gray-50 p-3 rounded border">
                  <strong>Important:</strong> Legal Probe is NOT a replacement for professional legal advice. 
                  The AI responses are for informational purposes only and should not be relied upon for legal decisions.
                </p>
              </div>
            </section>

            {/* 3. Development Status */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">3. Development Status & Support</h2>
              <div className="space-y-3 text-[#70798c]">
                <p>Legal Probe is currently in active development. This means:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Features may be added, modified, or removed without prior notice</li>
                  <li>The service may experience downtime, bugs, or unexpected behavior</li>
                  <li>Data storage and retention policies may change</li>
                  <li>User interface and functionality may be updated frequently</li>
                </ul>
                <div className="bg-blue-50 p-4 rounded border border-blue-200 mt-4">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Feature Requests & Improvements
                  </h3>
                  <p className="text-blue-700">
                    We welcome feedback, feature requests, and bug reports. Please contact us at{' '}
                    <a 
                      href="mailto:sumairsoomro@umass.edu" 
                      className="font-medium underline hover:text-blue-900"
                    >
                      sumairsoomro@umass.edu
                    </a>{' '}
                    to contribute to the development process.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. User Accounts */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">4. User Accounts and Authentication</h2>
              <div className="space-y-3 text-[#70798c]">
                <p>To use Legal Probe, you must:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Create an account with valid information</li>
                  <li>Maintain the security of your login credentials</li>
                  <li>Be responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
                <p>We use Supabase authentication to secure your account and ensure data privacy.</p>
              </div>
            </section>

            {/* 5. Acceptable Use */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">5. Acceptable Use Policy</h2>
              <div className="space-y-3 text-[#70798c]">
                <p>You agree NOT to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Upload documents containing illegal, harmful, or copyrighted content without permission</li>
                  <li>Attempt to reverse engineer, hack, or compromise the service</li>
                  <li>Use the service for any unlawful purposes</li>
                  <li>Share your account credentials with others</li>
                  <li>Upload excessive amounts of data that may impact service performance</li>
                  <li>Use the service to store or transmit malicious content</li>
                </ul>
              </div>
            </section>

            {/* 6. Data Storage */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">6. Data Storage and Chat History</h2>
              <div className="space-y-3 text-[#70798c]">
                <p>Legal Probe stores the following data to provide our service:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Uploaded Documents:</strong> PDF files you upload for analysis</li>
                  <li><strong>Chat Messages:</strong> Your questions and AI responses, including timestamps</li>
                  <li><strong>Session Data:</strong> Chat sessions to maintain conversation continuity</li>
                  <li><strong>Document Metadata:</strong> File names, sizes, page counts, and processing information</li>
                  <li><strong>User Account Information:</strong> Email, authentication data, and preferences</li>
                </ul>
                <div className="bg-gray-50 p-4 rounded border mt-4">
                  <p><strong>Data Persistence:</strong> Your chat history and uploaded documents persist across browser sessions 
                  and devices to provide a seamless experience. This data is stored securely using Supabase and 
                  Pinecone vector database services.</p>
                </div>
              </div>
            </section>

            {/* 7. Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">7. Intellectual Property</h2>
              <div className="space-y-3 text-[#70798c]">
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>You retain ownership of documents you upload</li>
                  <li>Legal Probe retains rights to improve the service based on usage patterns (without using your specific content)</li>
                  <li>You grant us permission to process your documents to provide the AI analysis service</li>
                  <li>You are responsible for ensuring you have rights to upload and analyze documents</li>
                </ul>
              </div>
            </section>

            {/* 8. Disclaimers */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">8. Disclaimers and Limitations</h2>
              <div className="space-y-3 text-[#70798c]">
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-2">Legal Disclaimer</h3>
                  <p className="text-red-700">
                    <strong>Legal Probe is NOT a law firm and does NOT provide legal advice.</strong> The AI responses are 
                    for informational purposes only. Always consult with qualified legal professionals for legal matters.
                  </p>
                </div>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>The service is provided "as is" without warranties of any kind</li>
                  <li>We do not guarantee accuracy, completeness, or reliability of AI responses</li>
                  <li>Use of the service is at your own risk</li>
                  <li>We are not liable for any decisions made based on AI-generated content</li>
                </ul>
              </div>
            </section>

            {/* 9. Service Availability */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">9. Service Availability</h2>
              <div className="space-y-3 text-[#70798c]">
                <p>Due to the developmental nature of Legal Probe:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Service may be interrupted for maintenance, updates, or improvements</li>
                  <li>Features may be temporarily unavailable</li>
                  <li>We may need to migrate or restructure data storage</li>
                  <li>No guarantee of 100% uptime during the development phase</li>
                </ul>
              </div>
            </section>

            {/* 10. Account Management */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">10. Account Management</h2>
              <div className="space-y-3 text-[#70798c]">
                <p>Regarding account management:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>We may suspend accounts for violations of these terms</li>
                  <li>Account deletion features are planned for future implementation</li>
                  <li>Contact us at sumairsoomro@umass.edu if you need assistance with your account</li>
                  <li>Some data may be retained for legal or operational purposes</li>
                </ul>
              </div>
            </section>

            {/* 11. Changes to Terms */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">11. Changes to These Terms</h2>
              <p className="text-[#70798c] leading-relaxed">
                As Legal Probe is in active development, these terms may be updated to reflect new features, legal requirements, 
                or operational changes. We will notify users of significant changes via email or platform notifications.
              </p>
            </section>

            {/* 12. Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-[#252323] mb-4">12. Contact Information</h2>
              <div className="bg-[#f5f1ed] p-4 rounded border">
                <p className="text-[#252323] mb-2">
                  For questions about these Terms of Service, feature requests, or technical support:
                </p>
                <div className="flex items-center gap-2 text-[#70798c]">
                  <Mail className="w-4 h-4" />
                  <a 
                    href="mailto:sumairsoomro@umass.edu" 
                    className="font-medium hover:text-[#252323] transition-colors"
                  >
                    sumairsoomro@umass.edu
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};