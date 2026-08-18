'use client';

import { Flame, Sparkles, UserPlus } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface DailyProgressWidgetProps {
  profile: UserProfile;
}

export default function DailyProgressWidget({ profile }: DailyProgressWidgetProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Daily Progress Glass Modal Card */}
      <div className="glass-modal rounded-3xl p-6 border border-white/15 space-y-6 shadow-2xl">
        <h3 className="font-heading text-lg font-extrabold text-white">Daily Progress</h3>

        {/* Progress Ring & Goal Info */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="text-indigo-400"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${profile.totalWordsLearned > 0 ? 75 : 0}, 100`}
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <span className="absolute font-mono-data text-sm font-extrabold text-white">{profile.totalWordsLearned > 0 ? '75%' : '0%'}</span>
          </div>

          <div>
            <p className="font-mono-data text-xs font-bold text-indigo-300 mb-0.5">Today&apos;s Goal</p>
            <p className="text-xs text-gray-400">{profile.totalWordsLearned > 0 ? '45' : '0'} / {profile.dailyGoal || 20} Cards Reviewed</p>
          </div>
        </div>

        {/* Streak Sub-card */}
        <div className="bg-[#13121b] p-4 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white flex items-center gap-1.5 font-bold">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              Current Streak
            </span>
            <span className="font-mono-data text-sm font-extrabold text-amber-300 text-glow">
              {profile.streakDays} Days
            </span>
          </div>

          {/* Weekday streak dots */}
          <div className="flex justify-between mt-3 px-1 font-mono-data text-[10px] text-gray-400">
            <div className="flex flex-col items-center gap-1 opacity-60">
              <span>M</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
            </div>
            <div className="flex flex-col items-center gap-1 opacity-60">
              <span>T</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
            </div>
            <div className="flex flex-col items-center gap-1 opacity-60">
              <span>W</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span>T</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span>F</span>
              <div className="w-2 h-2 rounded-full bg-white/10 border border-white/20" />
            </div>
            <div className="flex flex-col items-center gap-1 opacity-40">
              <span>S</span>
              <div className="w-2 h-2 rounded-full bg-white/10 border border-white/10" />
            </div>
            <div className="flex flex-col items-center gap-1 opacity-40">
              <span>S</span>
              <div className="w-2 h-2 rounded-full bg-white/10 border border-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Study Network Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
        <h3 className="font-heading text-sm font-extrabold text-white">Study Network</h3>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center bg-white/5">
            <UserPlus className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-300">No friends yet</p>
            <p className="text-[11px] text-gray-500 font-mono-data">Invite friends to compare</p>
          </div>
        </div>

        <button className="w-full text-center text-indigo-300 text-xs font-mono-data font-bold py-2.5 border border-white/10 rounded-xl hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5" /> Invite Friends
        </button>
      </div>
    </div>
  );
}
