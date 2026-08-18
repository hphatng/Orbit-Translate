'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Folder as FolderIcon, MoreVertical, Brain, Sparkles, FileSearch, Server, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_FOLDERS, MOCK_DECKS, INITIAL_VOCABULARY } from '@/lib/mockData';
import type { Folder, Deck, VocabularyItem } from '@/lib/types';
import { getUserDecks, getUserWords, getUserFolders, deleteFolder, renameFolder, createFolder } from '@/lib/services/supabaseService';
import { createClient } from '@/lib/supabase/client';

export default function StudyHubView() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Folder Menu State
  const [activeMenuFolderId, setActiveMenuFolderId] = useState<string | null>(null);
  
  // Folder actions state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  // New Deck Modal State
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckCategory, setNewDeckCategory] = useState<'IELTS' | 'Tech & AI' | 'Business' | 'Scan AI'>('Tech & AI');

  useEffect(() => {
    const supabase = createClient();

    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const decksRes = await getUserDecks(user.id);
      if (decksRes.success) {
        setDecks(decksRes.data);
      } else {
        setDecks([]);
      }

      const foldersRes = await getUserFolders(user.id);
      if (foldersRes.success) {
        setFolders(foldersRes.data);
      } else {
        setFolders([]);
      }
      
      const wordsRes = await getUserWords(user.id);
      if (wordsRes.success) {
        setVocabList(wordsRes.data);
      } else {
        setVocabList([]);
      }
    }

    loadUserData();

    // Revalidate automatically whenever the user focuses back on the website tab
    const onFocus = () => loadUserData();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadUserData();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Supabase Realtime Channel for instant live updates when words are synced from extension
    const channel = supabase
      .channel('realtime_words_studyhub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'words' }, () => {
        loadUserData();
      })
      .subscribe();

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, []);

  const getDeckIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'FileSearch': return <FileSearch className="w-5 h-5 text-emerald-400" />;
      case 'Server': return <Server className="w-5 h-5 text-purple-400" />;
      default: return <Brain className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;

    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      title: newDeckTitle.trim(),
      description: newDeckDesc.trim() || 'Bộ từ vựng tùy chỉnh mới tạo',
      category: newDeckCategory,
      totalWords: 0,
      masteredWords: 0,
      lastStudied: 'Vừa tạo',
      color: 'from-indigo-600 to-purple-600',
      iconName: 'Sparkles',
    };

    setDecks([newDeck, ...decks]);
    setNewDeckTitle('');
    setNewDeckDesc('');
    setIsCreateDeckOpen(false);
  };

  const handleRenameFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;
    const res = await renameFolder(editingFolder.id, newFolderName);
    if (res.success) {
      setFolders(folders.map(f => f.id === editingFolder.id ? { ...f, name: newFolderName } : f));
      setIsRenameModalOpen(false);
      setEditingFolder(null);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('Are you sure you want to delete this collection? The decks inside will be moved to Uncategorized.')) {
      const res = await deleteFolder(folderId);
      if (res.success) {
        setFolders(folders.filter(f => f.id !== folderId));
        if (selectedFolderId === folderId) setSelectedFolderId(null);
      }
    }
  };

  const scanDeck = decks.find(d => d.category === 'Scan AI' || d.id === 'deck_scan_ai' || d.title.toLowerCase().includes('scan') || d.title.toLowerCase().includes('tài liệu'));
  const scanWordsCount = scanDeck ? scanDeck.totalWords : vocabList.filter(w => (w as any).sourceType === 'SCAN_EXTRACT' || (w as any).source_type === 'SCAN_EXTRACT').length;
  const extWordsCount = vocabList.filter(w => (w as any).sourceType !== 'SCAN_EXTRACT' && (w as any).source_type !== 'SCAN_EXTRACT').length || vocabList.length;

  const showExtDeck = !selectedFolderId || selectedFolderId === 'fld_ext';
  const showScanDeck = !selectedFolderId || selectedFolderId === 'fld_scan';

  const customDecks = decks.filter((d) => {
    // Exclude core default decks from dynamic list to avoid duplicate rendering
    if (d.id === 'deck_ext_today' || d.id === 'deck_scan_ai' || d.category === 'Scan AI' || d.category === 'Extension') {
      return false;
    }
    if (selectedFolderId) {
      return d.folderId === selectedFolderId;
    }
    return true;
  });

  const totalVisibleDecksCount = (showExtDeck ? 1 : 0) + (showScanDeck ? 1 : 0) + customDecks.length;

  return (
    <div className="pb-24 max-w-5xl">
      <div className="mb-8">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">Study Hub</h2>
        <p className="text-gray-400 mt-2">Manage your vocabulary collections and decks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Folders */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-xl font-bold text-white">Collections</h3>
            <button
              onClick={() => setIsCreateDeckOpen(true)}
              className="text-xs font-mono-data font-bold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          <div className="flex flex-col gap-3 relative">
            {/* Default Pinned Chrome Extension Collection */}
            <div
              onClick={() => setSelectedFolderId(selectedFolderId === 'fld_ext' ? null : 'fld_ext')}
              className={`glass-card rounded-2xl p-4 flex items-center justify-between transition-colors cursor-pointer border ${selectedFolderId === 'fld_ext' ? 'bg-amber-500/15 border-amber-500/60' : 'border-amber-500/20 hover:bg-amber-500/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-amber-300">Extension Today</p>
                  <p className="text-xs text-gray-400 font-mono-data">{extWordsCount} Words</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-mono-data font-bold">
                Default
              </span>
            </div>

            {/* Default Pinned Tài Liệu Scan AI Collection */}
            <div
              onClick={() => setSelectedFolderId(selectedFolderId === 'fld_scan' ? null : 'fld_scan')}
              className={`glass-card rounded-2xl p-4 flex items-center justify-between transition-colors cursor-pointer border ${selectedFolderId === 'fld_scan' ? 'bg-indigo-500/15 border-indigo-500/60' : 'border-indigo-500/20 hover:bg-indigo-500/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-indigo-300">Tài liệu Scan AI</p>
                  <p className="text-xs text-gray-400 font-mono-data">{scanWordsCount} Words</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono-data font-bold">
                Default
              </span>
            </div>

            {/* User Custom Collections */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`glass-card rounded-2xl p-4 flex items-center justify-between transition-colors cursor-pointer border relative ${selectedFolderId === folder.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'border-white/10 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    <FolderIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-white">{folder.name}</p>
                    <p className="text-xs text-gray-400 font-mono-data">{folder.deckCount || 0} Sets</p>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuFolderId(activeMenuFolderId === folder.id ? null : folder.id);
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500 hover:text-white" />
                  </button>
                  
                  <AnimatePresence>
                    {activeMenuFolderId === folder.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-6 mt-1 w-32 bg-[#1E293B] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuFolderId(null);
                            setEditingFolder(folder);
                            setNewFolderName(folder.name);
                            setIsRenameModalOpen(true);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10"
                        >
                          Rename
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuFolderId(null);
                            handleDeleteFolder(folder.id);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Decks */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-xl font-bold text-white">
              Decks ({totalVisibleDecksCount})
            </h3>
            {selectedFolderId && (
               <button onClick={() => setSelectedFolderId(null)} className="text-xs text-gray-400 hover:text-white">
                 Clear Filter
               </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Chrome Extension Today Default Deck (Instant Zero-Delay Render) */}
            {showExtDeck && (
              <div
                className="glass-card p-5 rounded-2xl border border-amber-500/30 flex flex-col justify-between group hover:border-amber-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)] min-h-[190px]"
                onClick={() => router.push(`/study-hub/practice/deck_ext_today`)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-mono-data font-bold">
                      Synced Today
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading text-base font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                      Chrome Extension Today
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 font-sans">
                      Từ vựng bạn vừa bôi đen tra bằng Extension hôm nay
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono-data text-gray-400">{extWordsCount} words</span>
                  <button className="btn-primary-indigo text-xs font-mono-data font-bold px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white border-none">
                    Study Now
                  </button>
                </div>
              </div>
            )}

            {/* 2. Tài Liệu Scan AI Default Deck (Instant Zero-Delay Render) */}
            {showScanDeck && (
              <div
                className="glass-card p-5 rounded-2xl border border-indigo-500/30 flex flex-col justify-between group hover:border-indigo-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.1)] min-h-[190px]"
                onClick={() => router.push(`/study-hub/practice/${scanDeck?.id || 'deck_scan_ai'}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <FileSearch className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-mono-data font-bold">
                      Scan AI
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading text-base font-bold text-indigo-300 group-hover:text-indigo-200 transition-colors">
                      Tài Liệu Scan AI
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 font-sans">
                      Từ vựng, cụm từ &amp; ngữ pháp trích xuất từ tài liệu Scan
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono-data text-gray-400">{scanWordsCount} words</span>
                  <button className="btn-primary-indigo text-xs font-mono-data font-bold px-4 py-1.5">
                    Study Now
                  </button>
                </div>
              </div>
            )}
            
            {/* Custom User Decks */}
            {customDecks.map((deck) => {
              const wordCount = deck.totalWords;

              return (
                <div
                  key={deck.id}
                  className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-indigo-500/40 transition-all cursor-pointer"
                  onClick={() => router.push(`/study-hub/practice/${deck.id}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        {getDeckIcon(deck.iconName)}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-mono-data font-bold">
                        {deck.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-heading text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {deck.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1 font-sans">
                        {deck.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono-data text-gray-400">{wordCount} words</span>
                    <button className="btn-primary-indigo text-xs font-mono-data font-bold px-4 py-1.5">
                      Study Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create New Deck Modal */}
      <AnimatePresence>
        {isCreateDeckOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl font-sans"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-white font-heading">Tạo Bộ Từ Vựng Mới</h3>
                <button onClick={() => setIsCreateDeckOpen(false)} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDeck} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono-data font-bold text-gray-400 mb-1">TÊN BỘ TỪ</label>
                  <input
                    type="text"
                    value={newDeckTitle}
                    onChange={(e) => setNewDeckTitle(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-data font-bold text-gray-400 mb-1">MÔ TẢ NGẮN</label>
                  <textarea
                    rows={2}
                    value={newDeckDesc}
                    onChange={(e) => setNewDeckDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-data font-bold text-gray-400 mb-1">CHỦ ĐỀ</label>
                  <select
                    value={newDeckCategory}
                    onChange={(e) => setNewDeckCategory(e.target.value as any)}
                    className="w-full bg-[#1F2937] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
                  >
                    <option value="Tech & AI">Tech & AI</option>
                    <option value="IELTS">IELTS Academic</option>
                    <option value="Business">Business & Finance</option>
                    <option value="Scan AI">Scan AI Documents</option>
                  </select>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setIsCreateDeckOpen(false)} className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300">
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary-indigo px-6 py-2.5 text-xs font-bold shadow-lg shadow-indigo-600/30">
                    Tạo Bộ Từ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Folder Modal */}
      <AnimatePresence>
        {isRenameModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4">Rename Collection</h3>
              <input 
                type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 mb-6"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameFolder}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
