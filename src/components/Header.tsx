import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { APP_LOGO_URL } from '../data/initialData';
import { ActiveTab } from '../types';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddTxModalOpen, resetToDefaults, exportCsv, stats, isSyncing } = useFinance();
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'ภาพรวม' },
    { id: 'transactions', label: 'บันทึกรายการ' },
    { id: 'reports', label: 'รายงาน & สรุป' },
    { id: 'budgets', label: 'งบประมาณ' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-b border-outline-variant/20">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand & Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            {!logoError ? (
              <img
                alt="Obsidian Ledger Logo"
                className="h-8 w-8 object-contain rounded-lg shrink-0"
                src={APP_LOGO_URL}
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary font-bold">
                <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base font-headline font-semibold tracking-tight text-on-surface leading-tight group-hover:text-primary transition-colors">
                Obsidian Ledger
              </span>
              <span className="text-[11px] text-on-surface-variant font-label leading-tight">
                บันทึกรายรับ-รายจ่าย
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5 p-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-surface-container-high text-on-surface font-medium'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firebase Cloud Sync Status */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/80 border border-outline-variant/30 text-[11px] text-on-surface-variant font-mono"
            title="เชื่อมต่อ Firebase Cloud Firestore อัตโนมัติ"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-tertiary'
              }`}
            />
            <span className="text-[11px]">{isSyncing ? 'กำลังซิงค์...' : 'Firebase เชื่อมต่อแล้ว'}</span>
          </div>

          {/* Quick Add CTA */}
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-dim transition-colors cursor-pointer shadow-md shadow-primary/10 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">บันทึกรายการใหม่</span>
            <span className="sm:hidden">บันทึก</span>
          </button>

          {/* User Profile Avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              type="button"
              className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/50 bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 shrink-0"
              title={user?.displayName || 'ข้อมูลผู้ใช้และตั้งค่า'}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="material-symbols-outlined text-[18px]">person</span>
              )}
            </button>

            {/* Profile & Setting Popover */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-surface-container p-4 shadow-2xl border border-outline-variant/40 z-50 text-xs text-on-surface space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/30">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/40 bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">account_circle</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate text-on-surface">
                        {user?.displayName || 'ผู้ใช้งาน Google'}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        {user?.email || 'เข้าสู่ระบบด้วย Google แล้ว'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 py-1 text-on-surface-variant text-[11px]">
                    <div className="flex justify-between">
                      <span>ยอดเงินคงเหลือสุทธิ:</span>
                      <span className="font-mono text-on-surface font-semibold">
                        ฿{stats.netWorth.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>อัตราการออมปัจจุบัน:</span>
                      <span className="font-mono text-tertiary font-semibold">{stats.savingsRate}%</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-outline-variant/20 text-[10px]">
                      <span className="flex items-center gap-1 text-tertiary">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        Cloud Firestore:
                      </span>
                      <span className="font-mono text-on-surface-variant truncate max-w-[140px]" title="ai-studio-obsidianledger-9f7d1de0-378e-4ba9-a419-be54e209f863">
                        เชื่อมต่อสำเร็จ
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/30 space-y-1.5">
                    <button
                      onClick={() => {
                        exportCsv();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high text-on-surface flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">download</span>
                      <span>ส่งออกข้อมูลทั้งหมด (CSV)</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowResetConfirm(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-error/10 text-error flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                      <span>ล้างข้อมูลเป็น 0 (Reset All)</span>
                    </button>
                    <button
                      onClick={async () => {
                        setShowProfileMenu(false);
                        await signOut();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high text-on-surface flex items-center gap-2 cursor-pointer transition-colors border-t border-outline-variant/20 pt-2 text-error"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>ออกจากระบบ (Sign Out)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-1 bg-surface-container border-t border-outline-variant/20 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-surface-container-high text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-outline-variant/40 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">restart_alt</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-on-surface font-headline">ยืนยันการรีเซ็ตข้อมูล</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  คุณต้องการรีเซ็ตข้อมูลธุรกรรมและงบประมาณทั้งหมดใช่หรือไม่?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-medium hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-error text-white font-semibold text-xs hover:bg-error/90 shadow-md shadow-error/20 transition-all cursor-pointer"
              >
                ยืนยันการรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
