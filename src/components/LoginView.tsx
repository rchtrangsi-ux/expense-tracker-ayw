import React, { useState } from 'react';
import { useAuth, SavedAccount } from '../context/AuthContext';
import { APP_LOGO_URL } from '../data/initialData';

const AVATAR_OPTIONS = [
  { icon: 'account_balance_wallet', label: 'กระเป๋าเงิน' },
  { icon: 'person', label: 'ส่วนตัว' },
  { icon: 'savings', label: 'เงินออม' },
  { icon: 'diamond', label: 'สินทรัพย์' },
  { icon: 'rocket_launch', label: 'เติบโต' },
  { icon: 'storefront', label: 'ร้านค้า' },
  { icon: 'star', label: 'ดาว' },
  { icon: 'bolt', label: 'สายลุย' },
];

export const LoginView: React.FC = () => {
  const {
    createAccount,
    loginAccount,
    savedAccounts,
    removeSavedAccount,
    authError,
    clearAuthError,
  } = useAuth();

  const [activeMode, setActiveMode] = useState<'create' | 'login'>('create');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('account_balance_wallet');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const switchMode = (mode: 'create' | 'login') => {
    setActiveMode(mode);
    clearAuthError();
    setValidationError(null);
  };

  const handleSelectSavedAccount = (acc: SavedAccount) => {
    setUsername(acc.username);
    setActiveMode('login');
    clearAuthError();
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setValidationError(null);

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setValidationError('กรุณากรอกชื่อแอคเคาท์');
      return;
    }

    if (cleanUsername.length < 2) {
      setValidationError('ชื่อแอคเคาท์ต้องมีความยาวอย่างน้อย 2 ตัวอักษร');
      return;
    }

    if (!password) {
      setValidationError('กรุณากรอกรหัสผ่าน');
      return;
    }

    if (activeMode === 'create') {
      if (password.length < 6) {
        setValidationError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (activeMode === 'create') {
        await createAccount(cleanUsername, password, selectedAvatar);
      } else {
        await loginAccount(cleanUsername, password);
      }
    } catch {
      // Error handled and formatted in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = validationError || authError;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-4 selection:bg-primary/30 selection:text-primary-fixed relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-surface-container rounded-2xl p-6 sm:p-8 shadow-2xl border border-outline-variant/30 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Icon & Name */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            {!logoError ? (
              <img
                alt="Obsidian Ledger Logo"
                className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-2xl shadow-lg border border-outline-variant/30 p-1 bg-surface-container-low"
                src={APP_LOGO_URL}
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center text-primary shadow-lg">
                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold font-headline tracking-tight text-on-surface pt-1">
            Obsidian Ledger
          </h1>
          <p className="text-xs text-on-surface-variant font-label">
            ระบบบันทึกรายรับ-รายจ่าย และจัดการบัญชีเงินส่วนบุคคล
          </p>
        </div>

        {/* Tab Switcher: สร้างแอคเคาท์ใหม่ / เข้าสู่ระบบ */}
        <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <button
            type="button"
            onClick={() => switchMode('create')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'create'
                ? 'bg-surface-container-high text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>สร้างแอคเคาท์ใหม่</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'login'
                ? 'bg-surface-container-high text-on-surface shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">login</span>
            <span>เข้าสู่ระบบแอคเคาท์</span>
          </button>
        </div>

        {/* Quick Accounts list on device (if available) */}
        {savedAccounts.length > 0 && activeMode === 'login' && (
          <div className="space-y-2 p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/20">
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">history</span>
                แอคเคาท์ในเครื่องนี้:
              </span>
              <span className="text-[10px] text-primary">แตะเพื่อเลือก</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {savedAccounts.map((acc) => (
                <div
                  key={acc.username}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs cursor-pointer border transition-colors ${
                    username.toLowerCase() === acc.username.toLowerCase()
                      ? 'bg-primary/15 text-primary border-primary/40 font-semibold'
                      : 'bg-surface-container-high text-on-surface border-outline-variant/30 hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectSavedAccount(acc)}
                >
                  <span className="material-symbols-outlined text-[14px]">{acc.avatarIcon || 'person'}</span>
                  <span>{acc.displayName || acc.username}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSavedAccount(acc.username);
                    }}
                    className="ml-1 text-on-surface-variant hover:text-error text-[10px]"
                    title="ลบออกจากรายการเครื่องนี้"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {displayError && (
          <div className="p-3 bg-error/15 text-error rounded-xl text-xs flex items-start gap-2 border border-error/20 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">ข้อความแจ้งเตือน</p>
              <p className="mt-0.5 text-[11px] opacity-90">{displayError}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearAuthError();
                setValidationError(null);
              }}
              className="text-error/70 hover:text-error cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        )}

        {/* Main Account Form (No Email) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              ชื่อแอคเคาท์ (Account Name / Username) *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                badge
              </span>
              <input
                required
                type="text"
                autoComplete="username"
                placeholder="เช่น somchai, myledger, ร้านค้า หรือชื่อของคุณ"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-xs pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/40"
              />
            </div>
            {activeMode === 'create' && (
              <p className="text-[10px] text-on-surface-variant/70 mt-1">
                ใช้เป็นชื่อระบุตัวตนสำหรับจัดเก็บข้อมูลและเรียกดูในครั้งถัดไป
              </p>
            )}
          </div>

          {/* Avatar selector (Only in Create Mode) */}
          {activeMode === 'create' && (
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                เลือกไอคอนประจำแอคเคาท์
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.icon}
                    type="button"
                    onClick={() => setSelectedAvatar(opt.icon)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedAvatar === opt.icon
                        ? 'bg-primary/20 border-primary text-primary shadow-sm'
                        : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                    <span className="text-[10px] font-medium leading-none">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              รหัสผ่านสำหรับแอคเคาท์ (Password) *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                lock
              </span>
              <input
                required
                type="password"
                placeholder={activeMode === 'create' ? 'ตั้งรหัสผ่านอย่างน้อย 6 หลัก' : 'กรอกรหัสผ่านของคุณ'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-xs pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/40 font-mono"
              />
            </div>
          </div>

          {activeMode === 'create' && (
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                ยืนยันรหัสผ่าน (Confirm Password) *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                  lock_reset
                </span>
                <input
                  required
                  type="password"
                  placeholder="พิมพ์รหัสผ่านเดิมอีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-xs pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/40 font-mono"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-fixed-dim transition-all cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{activeMode === 'create' ? 'กำลังสร้างแอคเคาท์...' : 'กำลังเข้าสู่ระบบ...'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  {activeMode === 'create' ? 'person_add' : 'login'}
                </span>
                <span>{activeMode === 'create' ? 'สร้างแอคเคาท์และเริ่มเก็บข้อมูล' : 'เข้าใช้งานแอคเคาท์'}</span>
              </>
            )}
          </button>
        </form>

        {/* Feature Highlights Note */}
        <div className="p-3 bg-surface-container-low/80 rounded-xl border border-outline-variant/20 text-[11px] text-on-surface-variant space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[15px]">verified_user</span>
            <span>พื้นที่จัดเก็บข้อมูลแยกตามแอคเคาท์ ปลอดภัยและเป็นส่วนตัว</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[15px]">cloud_sync</span>
            <span>บันทึกข้อมูลธุรกรรมและงบประมาณขึ้นคลาวด์อัตโนมัติ</span>
          </div>
        </div>

        {/* Mode toggle prompt at bottom */}
        <div className="text-center pt-1">
          {activeMode === 'create' ? (
            <p className="text-xs text-on-surface-variant">
              มีแอคเคาท์อยู่แล้ว?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                เข้าสู่ระบบที่นี่
              </button>
            </p>
          ) : (
            <p className="text-xs text-on-surface-variant">
              ต้องการสร้างแอคเคาท์ใหม่?{' '}
              <button
                type="button"
                onClick={() => switchMode('create')}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                สร้างแอคเคาท์ที่นี่
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
