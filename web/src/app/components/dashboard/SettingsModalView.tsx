'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { X, Camera, Flame, Check, BookOpen, Briefcase, User, Mail, Award, Target, LogOut, Sparkles, Key } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import ApiKeysManager from './ApiKeysManager';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
];

interface SettingsModalViewProps {
  profile: UserProfile;
  onSaveProfile: (p: UserProfile) => void;
  prevRoute: string;
}

export default function SettingsModalView({ profile, onSaveProfile, prevRoute }: SettingsModalViewProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isOpen = pathname?.startsWith('/settings');
  const activeTab = pathname === '/settings/api-keys' ? 'api-keys' : 'profile';

  // Profile Form State
  const [fullName, setFullName] = useState(profile.fullName);
  const [bio, setBio] = useState(profile.bio || '');
  const [occupation, setOccupation] = useState(profile.occupation || '');
  const [targetCefr, setTargetCefr] = useState(profile.targetCefr);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoal);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || AVATAR_PRESETS[0]);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Sync profile prop to state when it loads
  useEffect(() => {
    setFullName(profile.fullName);
    setBio(profile.bio || '');
    setOccupation(profile.occupation || '');
    setTargetCefr(profile.targetCefr);
    setDailyGoal(profile.dailyGoal);
    setAvatarUrl(profile.avatarUrl || AVATAR_PRESETS[0]);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.from('profiles').update({
      full_name: fullName,
      bio: bio,
      occupation: occupation,
      target_cefr: targetCefr,
      daily_goal: dailyGoal,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    }).eq('id', profile.id);

    onSaveProfile({
      ...profile,
      fullName, bio, occupation, targetCefr, dailyGoal, avatarUrl
    });

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('orbit_logged_in');
    localStorage.removeItem('orbit_user_email');
    window.location.href = '/login';
  };

  const handleClose = () => {
    router.push(prevRoute);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-[#090A0F]/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[800px] bg-[#12151D] border border-white/5 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden text-white font-sans flex flex-col max-h-[90vh]"
        >
          {/* Header Area (Fixed) */}
          <div className="relative pt-8 pb-6 px-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 shrink-0 border-b border-white/5">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#6366F1]/10 blur-[64px] pointer-events-none" />

            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Avatar & Signature "Orbit Ring" */}
            <div className="relative flex items-center gap-5 z-10 w-full sm:w-auto">
              <div className="relative w-20 h-20 shrink-0">
                {/* Orbit Rings */}
                <div className="absolute inset-[-12px] animate-[spin_10s_linear_infinite] opacity-50">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#6366F1] stroke-[0.5]">
                    <ellipse cx="50" cy="50" rx="46" ry="18" transform="rotate(45 50 50)" />
                    <ellipse cx="50" cy="50" rx="46" ry="18" transform="rotate(-45 50 50)" />
                    <circle cx="83" cy="83" r="2" className="fill-[#818CF8]" />
                  </svg>
                </div>
                
                <div className="relative group w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-[#090A0F]">
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-sm">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-heading font-extrabold text-white tracking-tight">{fullName}</h2>
                  <div className="px-2 py-0.5 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#818CF8] text-[10px] font-mono-data font-bold uppercase tracking-wider">
                    PRO
                  </div>
                </div>
                <p className="text-sm text-gray-400 font-sans">{profile.email}</p>
              </div>
            </div>

            {/* Right: Stats without generic cards */}
            <div className="flex items-center gap-5 z-10 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-center">
                <div className="text-2xl font-mono-data font-bold text-white flex items-center justify-center gap-1.5">
                  <Flame className="w-5 h-5 text-[#F59E0B]" />
                  {profile.streakDays}
                </div>
                <div className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Ngày học</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-mono-data font-bold text-white">
                  {profile.totalWordsLearned}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#818CF8] mt-1 tracking-wider">Từ vựng</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-mono-data font-bold text-white">
                  {profile.masteryRate}%
                </div>
                <div className="text-[10px] uppercase font-bold text-[#10B981] mt-1 tracking-wider">Độ trôi chảy</div>
              </div>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="px-8 pt-6 pb-2 shrink-0">
            <div className="inline-flex items-center p-1 bg-black/40 rounded-xl border border-white/5">
              <button
                onClick={() => router.push('/settings')}
                className={`relative px-5 py-2 rounded-lg text-xs font-mono-data font-bold transition-colors ${
                  activeTab === 'profile' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {activeTab === 'profile' && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#1F2937] rounded-lg shadow-sm" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Hồ Sơ Cá Nhân
                </span>
              </button>

              <button
                onClick={() => router.push('/settings/api-keys')}
                className={`relative px-5 py-2 rounded-lg text-xs font-mono-data font-bold transition-colors ${
                  activeTab === 'api-keys' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {activeTab === 'api-keys' && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#1F2937] rounded-lg shadow-sm" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" /> Hệ Thống Lõi AI
                </span>
              </button>
            </div>
          </div>

          {/* Scrollable Body with Wait Transition */}
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' ? (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono-data font-bold text-gray-400 uppercase tracking-wider">Họ và Tên</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors font-sans placeholder-gray-600"
                          placeholder="Tên hiển thị..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono-data font-bold text-gray-400 uppercase tracking-wider">Email liên kết</label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full bg-transparent border-b border-transparent px-0 py-2 text-sm text-gray-500 cursor-not-allowed font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono-data font-bold text-gray-400 uppercase tracking-wider">Mục tiêu CEFR</label>
                        <select
                          value={targetCefr}
                          onChange={(e) => setTargetCefr(e.target.value)}
                          className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors font-sans"
                        >
                          <option value="B1 (Intermediate)">B1 (Intermediate)</option>
                          <option value="B2 (Upper-Intermediate)">B2 (Upper-Intermediate)</option>
                          <option value="C1 (Advanced)">C1 (Advanced)</option>
                          <option value="C2 (Proficient)">C2 (Proficient)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono-data font-bold text-gray-400 uppercase tracking-wider">Cường độ học tập</label>
                        <select
                          value={dailyGoal}
                          onChange={(e) => setDailyGoal(Number(e.target.value))}
                          className="w-full bg-[#090A0F] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors font-sans"
                        >
                          <option value={10}>10 từ / ngày (Duy trì)</option>
                          <option value={20}>20 từ / ngày (Tiêu chuẩn)</option>
                          <option value={30}>30 từ / ngày (Chuyên sâu)</option>
                          <option value={50}>50 từ / ngày (Cực hạn)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono-data font-bold text-gray-400 uppercase tracking-wider">Chuyên ngành / Domain</label>
                      <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="vd: Computer Science, Economics..."
                        className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors font-sans placeholder-gray-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono-data font-bold text-gray-400 uppercase tracking-wider">Giới thiệu bản thân</label>
                      <textarea
                        rows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Viết một chút về mục tiêu của bạn..."
                        className="w-full bg-transparent border-b border-white/10 px-0 py-2 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors font-sans placeholder-gray-600 resize-none"
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 transition-colors flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Đăng Xuất
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] flex items-center gap-2"
                      >
                        {isSavedNotice ? (
                          <span className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" /> Đã lưu đồng bộ
                          </span>
                        ) : (
                          <span>Lưu Thiết Lập</span>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="apikeys-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ApiKeysManager />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
