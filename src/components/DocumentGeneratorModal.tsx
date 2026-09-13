import React, { useEffect, useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { DocumentTemplate, generateDocument, AVAILABLE_TEMPLATES } from '../utils/documentGenerator';

interface DocumentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  initialTitle?: string;
}

export const DocumentGeneratorModal: React.FC<DocumentGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialContent = '',
  initialTitle = '',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>('markdown');
  const [author, setAuthor] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [initialContent, initialTitle, isOpen]);

  const handleGenerate = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please enter both title and content');
      return;
    }

    setIsGenerating(true);

    try {
      const doc = generateDocument({
        title,
        content,
        template: selectedTemplate,
        author,
        date: new Date(),
      });

      const blob = new Blob([doc.content], { type: doc.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename;
      a.click();
      URL.revokeObjectURL(url);

      alert(`Document "${doc.filename}" downloaded successfully!`);
    } catch (error) {
      console.error('Document generation error:', error);
      alert('Error generating document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-stone-900">Document Generator</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-2">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Annual Business Report 2025"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
            />
          </div>

          {/* Author Input */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-2">
              Author (Optional)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name or organization"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Document Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVAILABLE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.value}
                  onClick={() => setSelectedTemplate(tmpl.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedTemplate === tmpl.value
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.12em] mb-1 text-amber-700">Template</div>
                  <div className="truncate">{tmpl.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your document content here. Support for markdown formatting."
              rows={8}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-mono text-sm resize-none"
            />
            <p className="text-xs text-stone-500 mt-1">
              {content.length} characters • Supports markdown formatting
            </p>
          </div>

          {/* Template Info */}
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <p className="text-xs text-stone-600">
              <strong>Selected:</strong> {AVAILABLE_TEMPLATES.find((t) => t.value === selectedTemplate)?.label}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Documents will be downloaded with auto-generated filenames based on title and template type.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-lg border border-stone-200 text-stone-700 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim() || !content.trim()}
            className="px-6 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate & Download'}
          </button>
        </div>
      </div>
    </div>
  );
};
