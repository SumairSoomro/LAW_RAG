import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#dad2bc] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#252323] rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-[#f5f1ed]" />
              </div>
              <span className="font-semibold text-[#252323]">Legal Probe</span>
            </div>
            <p className="text-sm text-[#70798c] leading-relaxed">
              AI-powered legal document assistant for analyzing PDF documents with precise citations and answers.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#70798c]">
              <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              <span>Currently in Development</span>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#252323] text-sm">Legal</h3>
            <div className="space-y-2">
              <Link 
                to="/terms" 
                className="block text-sm text-[#70798c] hover:text-[#252323] transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/privacy" 
                className="block text-sm text-[#70798c] hover:text-[#252323] transition-colors"
              >
                Privacy Policy
              </Link>
              <div className="text-xs text-[#70798c] pt-1">
                <p>Your data is stored securely and never sold to third parties.</p>
              </div>
            </div>
          </div>

          {/* Contact & Feedback */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#252323] text-sm">Get in Touch</h3>
            <div className="space-y-2">
              <a 
                href="mailto:sumairsoomro@umass.edu"
                className="flex items-center gap-2 text-sm text-[#70798c] hover:text-[#252323] transition-colors group"
              >
                <Mail className="w-4 h-4" />
                <span>sumairsoomro@umass.edu</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <div className="text-xs text-[#70798c] space-y-1 pt-1">
                <p>• Feature requests & improvements</p>
                <p>• Bug reports & technical issues</p>
                <p>• General feedback & suggestions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#dad2bc] mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#70798c]">
          <div className="flex items-center gap-4">
            <span>© 2025 Legal Probe</span>
            <span>•</span>
            <span>Powered by AI</span>
            <span>•</span>
            <span>Built with React & Supabase</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              Beta Version
            </span>
            <span>v0.1.0</span>
          </div>
        </div>

        {/* Development Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-4">
          <p className="text-xs text-amber-800 text-center">
            <strong>Development Notice:</strong> Legal Probe is actively being developed. 
            Features may change, and this is not intended as a substitute for professional legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
};