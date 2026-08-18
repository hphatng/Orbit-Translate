'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, FileText } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="markdown-obsidian text-gray-200 leading-relaxed font-sans text-sm sm:text-base space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading mt-6 mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-400 shrink-0" />
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading mt-6 mb-3 pb-2 border-b border-white/5 text-indigo-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-gray-100 font-heading mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-300 leading-relaxed my-3 font-sans">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1.5 my-3 text-gray-300 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-3 text-gray-300 pl-2">
              {children}
            </ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 p-4 rounded-2xl bg-indigo-500/10 border-l-4 border-indigo-500 text-indigo-200 text-sm font-sans italic backdrop-blur-sm shadow-sm">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#0B0F17]/80 shadow-lg">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/5 border-b border-white/10 text-xs font-mono-data uppercase text-indigo-300">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="py-3 px-4 font-bold tracking-wider">{children}</th>
          ),
          td: ({ children }) => (
            <td className="py-3 px-4 border-t border-white/5 text-gray-300">{children}</td>
          ),
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono-data text-xs" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <div className="relative my-4 rounded-2xl border border-white/10 bg-[#0A0D14] overflow-hidden shadow-xl">
                {/* Header bar of Code Block */}
                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-xs font-mono-data text-gray-400">
                  <span>{match ? match[1] : 'code'}</span>
                  <button
                    onClick={() => handleCopy(codeString)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {copiedCode === codeString ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono-data text-gray-200 leading-relaxed">
                  <code>{codeString}</code>
                </pre>
              </div>
            );
          },
          hr: () => <hr className="my-6 border-white/10" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline decoration-indigo-500/40 underline-offset-4 transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
