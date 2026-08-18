'use client';

import ApiKeysManager from '@/app/components/dashboard/ApiKeysManager';

export default function SettingsApiKeysPage() {
  return (
    <div className="pb-24 max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Cài Đặt &amp; Quản Lý API Keys
        </h2>
        <p className="text-gray-400 mt-2 font-sans text-sm">
          Cung cấp Google Gemini API Key cá nhân (BYOK) để sử dụng toàn bộ tính năng Scan &amp; Extract và Deep NLP AI.
        </p>
      </div>

      <ApiKeysManager />
    </div>
  );
}
