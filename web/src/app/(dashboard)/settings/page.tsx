'use client';

import ApiKeysManager from '@/app/components/dashboard/ApiKeysManager';

export default function SettingsProfilePage() {
  return (
    <div className="pb-24 max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Cài Đặt Hệ Thống
        </h2>
        <p className="text-gray-400 mt-2 font-sans text-sm">
          Quản lý khóa API, tùy chỉnh phương pháp học và cấu hình tài khoản Orbit Translate.
        </p>
      </div>

      <ApiKeysManager />
    </div>
  );
}
