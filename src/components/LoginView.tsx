import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_LOGO_URL } from '../data/initialData';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, authError, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 selection:bg-primary/30 selection:text-primary-fixed relative overflow-hidden">
      {/* Background ambient lighting accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-surface-container rounded-2xl p-8 shadow-2xl border border-outline-variant/30 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Icon & Name */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            {!logoError ? (
              <img
                alt="Obsidian Ledger Logo"
                className="h-16 w-16 object-contain rounded-2xl shadow-lg border border-outline-variant/30 p-1 bg-surface-container-low"
                src={APP_LOGO_URL}
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center text-primary shadow-lg">
                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-on-surface pt-2">
            Obsidian Ledger
          </h1>
          <p className="text-xs text-on-surface-variant font-label">
            ระบบบันทึกรายรับ-รายจ่าย และจัดการกระแสเงินสดส่วนบุคคล
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="bg-surface-container-low/70 rounded-xl p-4 border border-outline-variant/20 space-y-2.5 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-base">lock</span>
            <span>บันทึกข้อมูลปลอดภัยเฉพาะบัญชีของคุณ</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-tertiary text-base">sync</span>
            <span>ซิงค์ข้อมูลกระแสเงินสดและงบประมาณแบบเรียลไทม์</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-base">insights</span>
            <span>กราฟวิเคราะห์รายรับ-รายจ่ายและเป้าหมายเงินออม</span>
          </div>
        </div>

        {/* Error Notification */}
        {authError && (
          <div className="p-3 bg-error/15 text-error rounded-xl text-xs flex items-start gap-2 border border-error/20 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">ไม่สามารถเข้าสู่ระบบได้</p>
              <p className="mt-0.5 text-[11px] opacity-90">{authError}</p>
            </div>
            <button
              type="button"
              onClick={clearAuthError}
              className="text-error/70 hover:text-error cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-3 px-4 rounded-xl bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-semibold text-sm border border-outline-variant/40 flex items-center justify-center gap-3 transition-all cursor-pointer shadow hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <>
                <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </>
            )}
          </button>
        </div>

        {/* Security / Privacy notice */}
        <p className="text-[11px] text-center text-on-surface-variant leading-relaxed">
          เข้าสู่ระบบอย่างปลอดภัยผ่าน Google Identity ข้อมูลส่วนบุคคลและประวัติการเงินของคุณจะถูกเก็บรักษาอย่างเป็นส่วนตัว
        </p>
      </div>
    </div>
  );
};
