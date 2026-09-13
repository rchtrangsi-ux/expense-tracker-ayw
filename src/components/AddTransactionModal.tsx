import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AccountId, CategoryId, TransactionType } from '../types';

export const AddTransactionModal: React.FC = () => {
  const { isAddTxModalOpen, setIsAddTxModalOpen, addTransaction, categories, accounts } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('food');
  const [accountId, setAccountId] = useState<AccountId>('scb');
  const [destinationAccountId, setDestinationAccountId] = useState<AccountId>('innovestx');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isAddTxModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSaving(true);
    setTimeout(() => {
      addTransaction({
        type,
        amount: numAmount,
        categoryId,
        accountId,
        destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
        date,
        time,
        note: note.trim() || (type === 'income' ? 'รายรับ' : type === 'transfer' ? 'โอนเงิน' : 'รายจ่ายทั่วไป'),
      });
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsAddTxModalOpen(false);
        setNote('');
      }, 500);
    }, 350);
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
              NEW TRANSACTION
            </span>
            <h3 className="text-lg font-headline font-bold text-on-surface mt-0.5">
              บันทึกรายการใหม่
            </h3>
          </div>
          <button
            onClick={() => setIsAddTxModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Segment Picker */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
              ประเภทรายการ
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container-lowest rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'expense'
                    ? 'bg-error text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">arrow_outward</span>
                รายจ่าย
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'income'
                    ? 'bg-tertiary text-on-tertiary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">south_west</span>
                รายรับ
              </button>
              <button
                type="button"
                onClick={() => setType('transfer')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'transfer'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">sync_alt</span>
                โอนย้าย
              </button>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
            <div className="flex justify-between items-center text-xs text-on-surface-variant mb-1 font-mono">
              <span>AMOUNT</span>
              <span className={type === 'income' ? 'text-tertiary' : type === 'expense' ? 'text-error' : 'text-primary'}>
                {type === 'income' ? 'ระบุยอดรายรับ' : type === 'expense' ? 'ระบุยอดรายจ่าย' : 'ระบุยอดโอน'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold font-headline text-on-surface-variant select-none">฿</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-3xl font-headline font-bold text-on-surface focus:outline-none tracking-tight placeholder:text-outline-variant"
                placeholder="0.00"
              />
            </div>

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-outline-variant/20 overflow-x-auto text-xs">
              <span className="text-[11px] text-on-surface-variant font-mono mr-1">+ด่วน:</span>
              {['50', '100', '500', '1000', '5000'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-mono text-[11px] transition-colors cursor-pointer"
                >
                  {parseInt(val) >= 1000 ? `${parseInt(val) / 1000}K` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Select */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                เลือกหมวดหมู่
              </label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-container-high text-primary ring-1 ring-primary/60'
                          : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                      <span className="text-[10px] mt-1 font-medium truncate w-full">
                        {cat.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                {type === 'income' ? 'เข้าบัญชี' : 'หักจากบัญชี'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value as AccountId)}
                className="w-full bg-surface-container-low text-xs text-on-surface px-3 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  โอนไปยังบัญชี
                </label>
                <select
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value as AccountId)}
                  className="w-full bg-surface-container-low text-xs text-on-surface px-3 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {accounts
                    .filter((acc) => acc.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  วันที่ & เวลา
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-surface-container-low text-xs text-on-surface px-2 py-2 rounded-lg border border-outline-variant/30 font-mono"
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-surface-container-low text-xs text-on-surface px-2 py-2 rounded-lg border border-outline-variant/30 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Memo / Notes */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
              บันทึกช่วยจำ (Memo)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ข้าวกะเพราหมูกรอบ, กาแฟดริป, ค่าเดินทาง..."
              className="w-full bg-surface-container-low text-xs text-on-surface placeholder:text-on-surface-variant/40 px-3.5 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddTxModalOpen(false)}
              className="flex-1 py-3 px-4 rounded-xl bg-surface-container-high text-on-surface text-xs font-medium hover:bg-secondary-container transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed-dim font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>กำลังบันทึก...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                  <span>บันทึกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>บันทึกรายการ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
