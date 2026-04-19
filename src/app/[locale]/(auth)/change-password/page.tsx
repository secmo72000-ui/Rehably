'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/domains/auth/auth.store';
import { authService } from '@/domains/auth/auth.service';
import { Input, Button } from '@/ui/primitives';
import { LockIcon, EyeIcon, EyeOffIcon } from '@/ui/icons';
import type { Locale } from '@/configs/i18n.config';

export default function ChangePasswordPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as Locale) || 'ar';

  const { mustChangePassword, isAuthenticated, logout } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isRtl = locale === 'ar';

  // Guard: must be authenticated and must change password
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/${locale}/login`);
    }
  }, [isAuthenticated, locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }
    if (currentPassword === newPassword) {
      setError('كلمة المرور الجديدة يجب أن تختلف عن الحالية');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        // Clear mustChangePassword flag
        useAuthStore.setState({ mustChangePassword: false });
        setSuccess(true);
        // Redirect to portal after 2 seconds
        setTimeout(() => {
          const path = useAuthStore.getState().getRedirectPath();
          router.push(`/${locale}${path}`);
        }, 2000);
      } else {
        setError('فشل تغيير كلمة المرور. تأكد من صحة كلمة المرور الحالية.');
      }
    } catch {
      setError('فشل تغيير كلمة المرور. تأكد من صحة كلمة المرور الحالية.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full bg-[#8c8c8c] min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-gray-800">تم تغيير كلمة المرور بنجاح</h2>
          <p className="text-gray-500">جاري تحويلك إلى لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#8c8c8c] min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[500px] bg-white rounded-lg shadow-2xl p-8 md:p-10">

        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <div className="text-4xl">🔑</div>
          <h1 className="text-2xl font-bold text-gray-800">تغيير كلمة المرور</h1>
          {mustChangePassword && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              يجب عليك تغيير كلمة المرور المؤقتة قبل المتابعة
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور الحالية (المؤقتة)
            </label>
            <Input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="أدخل كلمة المرور الحالية"
              icon={<LockIcon className="h-4 w-4" />}
              isRtl={isRtl}
              disabled={isLoading}
              endIcon={
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور الجديدة
            </label>
            <Input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={setNewPassword}
              placeholder="8 أحرف على الأقل"
              icon={<LockIcon className="h-4 w-4" />}
              isRtl={isRtl}
              disabled={isLoading}
              endIcon={
                <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تأكيد كلمة المرور الجديدة
            </label>
            <Input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="أعد كتابة كلمة المرور الجديدة"
              icon={<LockIcon className="h-4 w-4" />}
              isRtl={isRtl}
              disabled={isLoading}
              endIcon={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
          >
            تغيير كلمة المرور
          </Button>

          {/* Logout link */}
          <button
            type="button"
            onClick={() => { logout(); router.push(`/${locale}/login`); }}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-2"
          >
            تسجيل الخروج
          </button>
        </form>
      </div>
    </div>
  );
}
