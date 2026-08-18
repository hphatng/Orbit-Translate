'use client';

import React, { useState, useRef, useCallback } from 'react';
import { FileUp, FileText, X, AlertCircle } from 'lucide-react';

interface UnifiedDropzoneProps {
  onInputComplete: (input: { type: 'file' | 'text'; payload: File | string }) => void;
  maxSizeMB?: number;
}

const SUPPORTED_FORMATS = [
  'application/pdf', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export default function UnifiedDropzone({ onInputComplete, maxSizeMB = 25 }: UnifiedDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textMode, setTextMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Định dạng không được hỗ trợ. Vui lòng chọn .pdf, .docx, hoặc .txt');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Dung lượng file vượt quá giới hạn ${maxSizeMB}MB.`);
      return;
    }
    onInputComplete({ type: 'file', payload: file });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmitText = () => {
    if (!pastedText.trim()) {
      setError('Vui lòng nhập văn bản cần phân tích.');
      return;
    }
    setError(null);
    onInputComplete({ type: 'text', payload: pastedText.trim() });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!textMode ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-white/15 bg-[#131722] hover:border-indigo-500/50 hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${isDragging ? 'bg-indigo-500/20 text-indigo-300 scale-110' : 'bg-white/5 text-gray-400 group-hover:scale-110 group-hover:text-indigo-400'}`}>
            <FileUp className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Kéo thả file tài liệu vào đây</h3>
          <p className="text-sm text-gray-400 mb-6">
            Hỗ trợ PDF, DOCX, TXT. Tối đa {maxSizeMB}MB.
          </p>
          
          <div className="flex items-center gap-4 w-full max-w-xs">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hoặc</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setTextMode(true);
              setError(null);
            }}
            className="mt-6 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-gray-300 flex items-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4" /> Dán văn bản trực tiếp
          </button>
        </div>
      ) : (
        <div className="bg-[#131722] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> DÁN VĂN BẢN VÀO ĐÂY
            </h3>
            <button 
              onClick={() => {
                setTextMode(false);
                setError(null);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            rows={8}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Dán nội dung tài liệu, bài báo hoặc đoạn văn cần bóc tách từ vựng & ngữ pháp..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-3">
             <button 
              onClick={() => {
                setTextMode(false);
                setError(null);
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={handleSubmitText}
              className="btn-primary-indigo px-6 py-2.5 text-sm font-bold shadow-lg shadow-indigo-600/30"
            >
              Xác Nhận Văn Bản
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
