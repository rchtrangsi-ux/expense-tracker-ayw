import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AccountInfo } from '../types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ACCOUNTS = [
  { name: 'KBANK (กสิกรไทย)', subname: 'ธนาคารกสิกรไทย', type: 'savings', icon: 'account_balance' },
  { name: 'SCB (ไทยพาณิชย์)', subname: 'ธนาคารไทยพาณิชย์', type: 'savings', icon: 'account_balance' },
  { name: 'BBL (กรุงเทพ)', subname: 'ธนาคารกรุงเทพ', type: 'savings', icon: 'account_balance' },
  { name: 'KTB (กรุงไทย)', subname: 'ธนาคารกรุงไทย', type: 'savings', icon: 'account_balance' },
  { name: 'TTB (ทหารไทยธนชาต)', subname: 'ธนาคารทหารไทยธนชาต', type: 'savings', icon: 'account_balance' },
  { name: 'TrueMoney Wallet', subname: 'กระเป๋าเงินดิจิทัล', type: 'wallet', icon: 'wallet' },
  { name: 'เงินสดส่วนตัว (Cash)', subname: 'เงินสดในกระเป๋า', type: 'cash', icon: 'payments' },
  { name: 'บัตรเครดิต', subname: 'วงเงินสินเชื่อ', type: 'credit', icon: 'credit_card' },
  { name: 'พอร์ตลงทุน / หุ้น / กองทุน', subname: 'สินทรัพย์ลงทุน', type: 'investment', icon: 'trending_up' },
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount } = useFinance();

  const [name, setName] = useState('');
  const [subname, setSubname] = useState('');
  const [type, setType] = useState<AccountInfo['type']>('savings');
  const [balance, setBalance] = useState('');
  const [icon, setIcon] = useState('account_balance');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setName(preset.name);
    setSubname(preset.subname);
    setType(preset.type as AccountInfo['type']);
    setIcon(preset.icon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numBalance = parseFloat(balance.replace(/,/g, '')) || 0;

    setIsSaving(true);
    setTimeout(() => {
      addAccount({
        name: name.trim(),
        subname: subname.trim() || 'บัญชีส่วนบุคคล',
        type,
        balance: numBalance,
        icon,
      });
      setIsSaving(false);
      onClose();
      // Reset
      setName('');
      setSubname('');
      setBalance('');
      setType('savings');
      setIcon('account_balance');
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-surface-container rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-outline-variant/40 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div>
            <span className="text-[10px] tracking-widest uppercase font-mono text-primary font-bold">
              CREATE FINANCIAL ACCOUNT
            </span>
            <h3 className="text-lg font-headline font-bold text-on-surface mt-0.5">
              สร้างบัญชี / กระเป๋าเงินใหม่
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-[11px] font-medium text-on-surface-variant mb-2">
            เลือกแม่แบบด่วน (Quick Presets)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_ACCOUNTS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-2.5 py-1 text-xs rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">{preset.icon}</span>
                <span>{preset.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              ชื่อบัญชี (Account Name) *
            </label>
            <input
              required
              type="text"
              placeholder="เช่น บัญชีกสิกรไทย (ออมเงิน), TrueMoney Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                สถาบัน / คำอธิบายย่อย
              </label>
              <input
                type="text"
                placeholder="เช่น ธนาคารกสิกรไทย"
                value={subname}
                onChange={(e) => setSubname(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                ประเภทบัญชี
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountInfo['type'])}
                className="w-full bg-surface-container-low text-on-surface text-sm px-3 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="savings">เงินฝากออมทรัพย์ (Savings)</option>
                <option value="cash">เงินสด (Cash)</option>
                <option value="wallet">e-Wallet / ดิจิทัล (Wallet)</option>
                <option value="credit">บัตรเครดิต (Credit)</option>
                <option value="investment">พอร์ตลงทุน (Investment)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                ยอดเงินเริ่มต้น (Initial Balance)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-on-surface-variant font-mono text-sm">฿</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm font-mono pl-8 pr-3 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                ไอคอนแสดงผล
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface text-sm px-3 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="account_balance">🏛️ บัญชีธนาคาร (Bank)</option>
                <option value="payments">💵 เงินสด (Cash)</option>
                <option value="wallet">👛 กระเป๋าเงิน (Wallet)</option>
                <option value="credit_card">💳 บัตรเครดิต (Card)</option>
                <option value="trending_up">📈 การลงทุน (Invest)</option>
                <option value="savings">🐷 เงินออม (Piggy Bank)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-5 py-2 text-xs font-semibold text-on-primary bg-primary hover:bg-primary-fixed-dim rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>กำลังสร้างบัญชี...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>สร้างบัญชี</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
