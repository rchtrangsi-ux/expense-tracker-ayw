import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AccountId, CategoryId, TransactionType } from '../types';
import { CashflowBarChart } from './CashflowBarChart';

export const DashboardView: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, stats, accounts, goals, setActiveTab, exportCsv } = useFinance();

  // In-app Delete Confirmation Modal
  const [txToDelete, setTxToDelete] = useState<any | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  // Quick Add Bar state
  const [quickType, setQuickType] = useState<TransactionType>('expense');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState<CategoryId | ''>('');
  const [quickMemo, setQuickMemo] = useState('');
  const [quickAccount, setQuickAccount] = useState<AccountId>('scb');
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [quickSaveDone, setQuickSaveDone] = useState(false);

  // Period filter state
  const [period, setPeriod] = useState<'month' | 'q1' | 'year'>('month');

  // Dynamic category expense calculations
  const categoryStats = useMemo(() => {
    const expenseTxs = transactions.filter((t) => t.type === 'expense');
    const totalExp = stats.monthExpense;

    const food = expenseTxs.filter((t) => t.categoryId === 'food').reduce((s, t) => s + t.amount, 0);
    const utilities = expenseTxs.filter((t) => t.categoryId === 'utilities').reduce((s, t) => s + t.amount, 0);
    const commute = expenseTxs.filter((t) => t.categoryId === 'commute').reduce((s, t) => s + t.amount, 0);
    const shopping = expenseTxs.filter((t) => t.categoryId === 'shopping').reduce((s, t) => s + t.amount, 0);
    const other = expenseTxs
      .filter((t) => !['food', 'utilities', 'commute', 'shopping'].includes(t.categoryId))
      .reduce((s, t) => s + t.amount, 0);

    return {
      food,
      foodPct: totalExp > 0 ? ((food / totalExp) * 100).toFixed(1) : '0.0',
      foodWidth: totalExp > 0 ? Math.min(100, (food / totalExp) * 100) : 0,

      utilities,
      utilitiesPct: totalExp > 0 ? ((utilities / totalExp) * 100).toFixed(1) : '0.0',
      utilitiesWidth: totalExp > 0 ? Math.min(100, (utilities / totalExp) * 100) : 0,

      commute,
      commutePct: totalExp > 0 ? ((commute / totalExp) * 100).toFixed(1) : '0.0',
      commuteWidth: totalExp > 0 ? Math.min(100, (commute / totalExp) * 100) : 0,

      shopping,
      shoppingPct: totalExp > 0 ? ((shopping / totalExp) * 100).toFixed(1) : '0.0',
      shoppingWidth: totalExp > 0 ? Math.min(100, (shopping / totalExp) * 100) : 0,

      other,
      otherPct: totalExp > 0 ? ((other / totalExp) * 100).toFixed(1) : '0.0',
      otherWidth: totalExp > 0 ? Math.min(100, (other / totalExp) * 100) : 0,
    };
  }, [transactions, stats.monthExpense]);

  // Goal & Accounts calculations
  const goal1 = goals[0];
  const goal1Pct = goal1 && goal1.targetAmount > 0
    ? Math.min(100, Math.round((goal1.currentAmount / goal1.targetAmount) * 100))
    : 0;
  const ktcAcc = accounts.find((a) => a.id === 'ktc');
  const ktcBalance = ktcAcc ? ktcAcc.balance : 0;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(quickAmount);
    if (isNaN(num) || num <= 0) return;

    setIsQuickSaving(true);
    setTimeout(() => {
      addTransaction({
        type: quickType,
        amount: num,
        categoryId: (quickCategory as CategoryId) || (quickType === 'income' ? 'salary' : 'food'),
        accountId: quickAccount,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        note: quickMemo.trim() || (quickType === 'income' ? 'รายรับด่วน' : 'รายจ่ายทั่วไป'),
      });
      setIsQuickSaving(false);
      setQuickSaveDone(true);
      setQuickAmount('');
      setQuickMemo('');
      setQuickCategory('');
      setTimeout(() => setQuickSaveDone(false), 2000);
    }, 400);
  };

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-col w-full">
      {/* Subtle Ambient Glow */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-32 left-10 w-72 h-72 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top Command & Action Bar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span>ระบบออนไลน์ • อัปเดตล่าสุดวันนี้ 19:42 น.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight mt-1">
              สรุปสถานะการเงินส่วนบุคคล
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex bg-surface-container p-1 rounded-lg border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setPeriod('month')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  period === 'month'
                    ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                เดือนนี้ (มี.ค. 2025)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('q1')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  period === 'q1'
                    ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                ไตรมาส 1
              </button>
              <button
                type="button"
                onClick={() => setPeriod('year')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  period === 'year'
                    ? 'bg-surface-container-high text-on-surface shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                รอบปี
              </button>
            </div>
            <button
              onClick={exportCsv}
              title="ส่งออกรายงาน (Export CSV)"
              className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-lg transition-colors flex items-center justify-center cursor-pointer border border-outline-variant/30"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">file_download</span>
            </button>
          </div>
        </section>

        {/* Quick Add Bar (High Efficiency) */}
        <section className="bg-surface-container rounded-xl p-3 sm:p-4 shadow-xl border border-outline-variant/30">
          <form onSubmit={handleQuickSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Type selector */}
            <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
              <button
                type="button"
                onClick={() => setQuickType('expense')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  quickType === 'expense' ? 'bg-error text-white' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                รายจ่าย
              </button>
              <button
                type="button"
                onClick={() => setQuickType('income')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  quickType === 'income' ? 'bg-tertiary text-on-tertiary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                รายรับ
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex-1 gap-2.5">
              {/* Amount */}
              <div className="relative flex items-center">
                <span className="absolute left-3 text-on-surface-variant font-mono text-sm">฿</span>
                <input
                  required
                  step="0.01"
                  type="number"
                  placeholder="0.00"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm font-mono pl-8 pr-3 py-2 rounded-lg placeholder:text-on-surface-variant/40 focus:outline-none focus:bg-surface-container-high transition-colors border border-outline-variant/30"
                />
              </div>

              {/* Category */}
              <div className="relative">
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value as CategoryId)}
                  className="w-full appearance-none bg-surface-container-low text-on-surface text-sm px-3.5 py-2 rounded-lg focus:outline-none focus:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30"
                >
                  <option value="" disabled>
                    เลือกหมวดหมู่...
                  </option>
                  <option value="food">🍱 อาหาร & เครื่องดื่ม</option>
                  <option value="commute">🚗 การเดินทาง</option>
                  <option value="utilities">🏠 ที่พัก & ค่าใช้จ่ายบ้าน</option>
                  <option value="shopping">🎮 บันเทิง & ช้อปปิ้ง</option>
                  <option value="salary">💼 เงินเดือน / รายรับหลัก</option>
                  <option value="freelance">💻 รับงานฟรีแลนซ์</option>
                  <option value="other">⚡ อื่นๆ</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>

              {/* Memo */}
              <div className="relative">
                <input
                  type="text"
                  value={quickMemo}
                  onChange={(e) => setQuickMemo(e.target.value)}
                  placeholder="บันทึกช่วยจำ (เช่น ข้าวกะเพรา)"
                  className="w-full bg-surface-container-low text-on-surface text-sm px-3.5 py-2 rounded-lg placeholder:text-on-surface-variant/40 focus:outline-none focus:bg-surface-container-high transition-colors border border-outline-variant/30"
                />
              </div>
            </div>

            {/* Account & Submit */}
            <div className="flex items-center gap-2">
              <select
                value={quickAccount}
                onChange={(e) => setQuickAccount(e.target.value as AccountId)}
                className="bg-surface-container-low text-on-surface-variant text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:text-on-surface transition-colors cursor-pointer border border-outline-variant/30"
              >
                <option value="scb">SCB (หลัก)</option>
                <option value="kbank">KBank</option>
                <option value="cash">เงินสด</option>
                <option value="ktc">บัตรเครดิต KTC</option>
              </select>

              <button
                type="submit"
                disabled={isQuickSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-fixed-dim transition-colors shadow-md cursor-pointer active:scale-95 whitespace-nowrap"
              >
                {isQuickSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : quickSaveDone ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    <span>บันทึกสำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>บันทึกด่วน</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* 4 KPI Metrics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Balance / Net Worth */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-on-surface-variant">ยอดเงินคงเหลือรวม (Net Worth)</span>
              <div className="w-7 h-7 rounded-md bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-on-surface">
                ฿{stats.netWorth.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {stats.netWorth === 0 ? 'เริ่มต้นรอบบันทึกใหม่ (฿0.00)' : `รวม ${accounts.length} บัญชี`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              <span className="font-mono font-medium">{stats.netWorth === 0 ? '0.0%' : '+0.0%'}</span>
              <span className="text-[11px] text-on-surface-variant">สถานะบัญชีสุทธิ</span>
            </div>
          </div>

          {/* Total Income */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-on-surface-variant">รายรับประจำเดือน</span>
              <div className="w-7 h-7 rounded-md bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[18px]">south_west</span>
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-tertiary">
                +฿{stats.monthIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {stats.monthIncome === 0 ? 'ยังไม่มีรายรับในรอบนี้ (฿0.00)' : 'เป้าหมาย ฿60,000'}
              </p>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-tertiary h-full rounded-full transition-all duration-700"
                style={{ width: `${stats.monthIncome > 0 ? Math.min(100, (stats.monthIncome / 60000) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Total Expense */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-on-surface-variant">รายจ่ายประจำเดือน</span>
              <div className="w-7 h-7 rounded-md bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[18px]">north_east</span>
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-error">
                -฿{stats.monthExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {stats.monthExpense === 0 ? 'ยังไม่มีรายจ่ายในรอบนี้ (฿0.00)' : `งบควบคุม: ฿${stats.budgetTotal.toLocaleString('th-TH')}`}
              </p>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-error h-full rounded-full transition-all duration-700"
                style={{
                  width: `${
                    stats.budgetTotal > 0
                      ? Math.min(100, (stats.monthExpense / stats.budgetTotal) * 100)
                      : stats.monthExpense > 0
                      ? 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Net Savings Rate */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-on-surface-variant">เงินออมสุทธิ & อัตราการออม</span>
              <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">savings</span>
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-primary">
                {stats.netSurplus >= 0 ? '+' : '-'}฿{Math.abs(stats.netSurplus).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-on-surface-variant">Savings Rate</span>
                <span className="text-xs font-mono font-bold text-tertiary">{stats.savingsRate}%</span>
              </div>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, stats.savingsRate))}%` }}
              />
            </div>
          </div>
        </section>

        {/* Main Visual Insights Grid (Bar Chart + Expense Breakdown) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cashflow Bar Chart (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            <CashflowBarChart />
          </div>

          {/* Expense Breakdown by Category (4 cols) */}
          <div className="lg:col-span-4 bg-surface-container rounded-xl p-6 shadow-xl flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-headline font-semibold text-on-surface">สัดส่วนค่าใช้จ่าย</h2>
                <p className="text-xs text-on-surface-variant">แจกแจงตามหมวดหมู่จริง</p>
              </div>
              <span className="text-xs font-mono text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/20">
                รวม ฿{stats.monthExpense.toLocaleString('th-TH', { minimumFractionDigits: 0 })}
              </span>
            </div>

            {/* Donut Mini Visual & Quick Stats */}
            <div className="flex items-center justify-center py-2 relative">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background ring */}
                <circle cx="50" cy="50" fill="none" r="38" stroke="#1c1c20" strokeWidth="13" />
                {stats.monthExpense > 0 ? (
                  <>
                    {/* Food Segment */}
                    {categoryStats.food > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="38"
                        stroke="#a78bfa"
                        strokeDasharray="238.76"
                        strokeDashoffset={238.76 - (238.76 * (categoryStats.food / stats.monthExpense))}
                        strokeWidth="13"
                        className="transition-all duration-700"
                      />
                    )}
                    {/* Commute Segment */}
                    {categoryStats.commute > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="38"
                        stroke="#fbbf24"
                        strokeDasharray="238.76"
                        strokeDashoffset={238.76 - (238.76 * (categoryStats.commute / stats.monthExpense))}
                        strokeWidth="13"
                        style={{
                          transform: `rotate(${(categoryStats.food / stats.monthExpense) * 360}deg)`,
                          transformOrigin: '50px 50px',
                        }}
                        className="transition-all duration-700"
                      />
                    )}
                    {/* Utilities Segment */}
                    {categoryStats.utilities > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="38"
                        stroke="#38bdf8"
                        strokeDasharray="238.76"
                        strokeDashoffset={238.76 - (238.76 * (categoryStats.utilities / stats.monthExpense))}
                        strokeWidth="13"
                        style={{
                          transform: `rotate(${((categoryStats.food + categoryStats.commute) / stats.monthExpense) * 360}deg)`,
                          transformOrigin: '50px 50px',
                        }}
                        className="transition-all duration-700"
                      />
                    )}
                  </>
                ) : (
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="38"
                    stroke="#27272a"
                    strokeDasharray="4 4"
                    strokeWidth="4"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                <span className="text-[10px] text-on-surface-variant font-medium">รวมรายจ่าย</span>
                <span className="text-sm font-headline font-bold text-on-surface">
                  ฿{stats.monthExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-tertiary font-mono">
                  {stats.monthExpense === 0 ? '0.0%' : '100%'}
                </span>
              </div>
            </div>

            {/* Category Progress Bars */}
            <div className="space-y-2.5 mt-3">
              {/* Food */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    อาหาร & เครื่องดื่ม
                  </span>
                  <span className="font-mono text-on-surface-variant">
                    ฿{categoryStats.food.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ({categoryStats.foodPct}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${categoryStats.foodWidth}%` }}
                  />
                </div>
              </div>

              {/* Housing & Utilities */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    ที่พัก & ค่าน้ำไฟ
                  </span>
                  <span className="font-mono text-on-surface-variant">
                    ฿{categoryStats.utilities.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ({categoryStats.utilitiesPct}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${categoryStats.utilitiesWidth}%` }}
                  />
                </div>
              </div>

              {/* Transport */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    การเดินทาง & น้ำมัน
                  </span>
                  <span className="font-mono text-on-surface-variant">
                    ฿{categoryStats.commute.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ({categoryStats.commutePct}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${categoryStats.commuteWidth}%` }}
                  />
                </div>
              </div>

              {/* Shopping */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    ช้อปปิ้ง & ไลฟ์สไตล์
                  </span>
                  <span className="font-mono text-on-surface-variant">
                    ฿{categoryStats.shopping.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ({categoryStats.shoppingPct}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-pink-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${categoryStats.shoppingWidth}%` }}
                  />
                </div>
              </div>

              {/* Other */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    อื่นๆ ทั่วไป
                  </span>
                  <span className="font-mono text-on-surface-variant">
                    ฿{categoryStats.other.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ({categoryStats.otherPct}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full transition-all duration-500"
                    style={{ width: `${categoryStats.otherWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Storytelling / Financial Health Summary Bento Card */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container rounded-xl p-5 shadow-lg flex items-center gap-4 border border-outline-variant/30">
            <img
              className="w-20 h-20 rounded-lg object-cover shrink-0 bg-surface-container-low"
              alt="Minimalist workspace"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApgXZNuTuSwVmtMeLAJJFmK6ln7DwpYv5cX_r0IMlua8UiAdzs81wsQW3bb1rrOAUhpCE2qJIKItjhlVpKH4nXVWxlM9vReTDHR3OefqLpUjczeAcXefS-1w10dGJf4RS04ujXo5pf46KFXTofA-d8SDjIV39pa88VebMxAD5_J49HxjmnirgeNA7poyvePL_aJZejA3wAgcLlL-ibmx_G56Ycs4h0LivgoF4--u45VLMc8wpcrftk"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-mono uppercase text-primary font-semibold">วินัยการเงิน</span>
              <h3 className="text-sm font-semibold text-on-surface truncate">เป้าหมายเงินเก็บฉุกเฉิน</h3>
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                เก็บได้ ฿{(goal1?.currentAmount || 0).toLocaleString('th-TH')} / ฿{(goal1?.targetAmount || 200000).toLocaleString('th-TH')} ({goal1Pct}%)
              </p>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-5 shadow-lg flex items-center gap-4 border border-outline-variant/30">
            <img
              className="w-20 h-20 rounded-lg object-cover shrink-0 bg-surface-container-low"
              alt="Architectural building facade"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCprgNhbGluB6MRme1RQubOS97OzzJGlDBeurftAnjoV9j_wBAw2FxQiuRZZIoC5pwv2q7Py4wzNjJ56kEsgX-id4bWEFjWMiCEJp-zyAHT6H7vV460ynMFsnQFwPesy-_8LNXp9N5JjUsly30y7GYpCp5U8dWpHwqY7j7RWj7FjHJW_TUyRvmp5e0q8OYXijAxm1z-dPAYG_xT5IrOz_adi1t8GyrwPLIifws8RlrEjKEIlkI-UAPp"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-mono uppercase text-tertiary font-semibold">สถานะบัญชี</span>
              <h3 className="text-sm font-semibold text-on-surface truncate">
                {ktcBalance < 0
                  ? `มียอดรอชำระ (฿${Math.abs(ktcBalance).toLocaleString('th-TH')})`
                  : `ไม่มีหนี้ค้างชำระ (฿${ktcBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })})`}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                {ktcBalance < 0
                  ? `ยอดใช้จ่ายบัตรเครดิต KTC: ฿${Math.abs(ktcBalance).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`
                  : `ยอดหนี้บัตรเครดิต KTC: ฿0.00 บัญชีคล่องตัวและโปร่งใส`}
              </p>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-5 shadow-lg flex items-center gap-4 border border-outline-variant/30">
            <img
              className="w-20 h-20 rounded-lg object-cover shrink-0 bg-surface-container-low"
              alt="Luxury wristwatch"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvwZNkgORo2GkK-pJHRH9MR3Okc-N3rAgr4W-3XskXI7Of3iOJ-vXDIGvFWYGhT931uCnvOYt0u4cthGVGngWPYPKVwWpLv9BVcTugaQSV_2rME6wR6AHqy1c6tBnLGVcw5YPebcq22L7-oqDuZm8tO0kh3c9YY-ZB96VbaRkvenwflksp76DlwpbvltYs88qQ5bT0JQfDDbJVUQTJL1k1TwHDSGGrWpab3XcxSx-b_VIK3ql7kbih"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-mono uppercase text-on-surface-variant font-semibold">ระบบแจ้งเตือน</span>
              <h3 className="text-sm font-semibold text-on-surface truncate">รอบบิลและบริการ</h3>
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                {transactions.length === 0
                  ? 'ยังไม่มีรายการรอตัดชำระ (฿0.00) พร้อมเริ่มต้นใช้งาน'
                  : `บันทึกแล้วทั้งหมด ${transactions.length} ธุรกรรมในระบบ`}
              </p>
            </div>
          </div>
        </section>

        {/* Recent Transactions Table */}
        <section className="bg-surface-container rounded-xl p-6 shadow-xl border border-outline-variant/30">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-headline font-semibold text-on-surface">รายการล่าสุด (Recent Transactions)</h2>
              <p className="text-xs text-on-surface-variant">5 ธุรกรรมล่าสุดที่บันทึกเข้าระบบ</p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-fixed-dim transition-colors cursor-pointer"
            >
              <span>ดูประวัติทั้งหมด</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] font-mono uppercase text-on-surface-variant bg-surface-container-low rounded-lg">
                  <th scope="col" className="py-2.5 px-4 rounded-l-lg">
                    รายการ
                  </th>
                  <th scope="col" className="py-2.5 px-4">
                    หมวดหมู่
                  </th>
                  <th scope="col" className="py-2.5 px-4">
                    บัญชี
                  </th>
                  <th scope="col" className="py-2.5 px-4">
                    วันและเวลา
                  </th>
                  <th scope="col" className="py-2.5 px-4 text-right">
                    จำนวนเงิน
                  </th>
                  <th scope="col" className="py-2.5 px-4 text-center rounded-r-lg">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-outline-variant">receipt_long</span>
                        <p className="text-sm font-medium text-on-surface">ยังไม่มีรายการธุรกรรมในระบบ (฿0.00)</p>
                        <p className="text-xs text-on-surface-variant">
                          ข้อมูลการเงินถูกรีเซ็ตเป็น 0 เรียบร้อยแล้ว สามารถกด "บันทึกรายการใหม่" เพื่อเริ่มบันทึก
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => {
                    const isExp = tx.type === 'expense';
                    const isInc = tx.type === 'income';

                    return (
                      <tr key={tx.id} className="hover:bg-surface-container-high/60 transition-colors group">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isInc
                                ? 'bg-tertiary-container/40 text-tertiary'
                                : isExp
                                ? 'bg-surface-container-highest text-primary'
                                : 'bg-surface-container-highest text-secondary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {tx.categoryId === 'food'
                                ? 'shopping_bag'
                                : tx.categoryId === 'freelance'
                                ? 'payments'
                                : tx.categoryId === 'commute'
                                ? 'local_gas_station'
                                : tx.categoryId === 'salary'
                                ? 'corporate_fare'
                                : 'receipt_long'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-on-surface text-sm">{tx.note}</div>
                            {tx.subNote && <div className="text-[11px] text-on-surface-variant">{tx.subNote}</div>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
                              isInc
                                ? 'bg-tertiary/10 text-tertiary'
                                : 'bg-surface-container-highest text-on-surface-variant'
                            }`}
                          >
                            {tx.categoryName || tx.categoryId}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                tx.accountId === 'scb'
                                  ? 'bg-purple-500'
                                  : tx.accountId === 'kbank'
                                  ? 'bg-emerald-500'
                                  : tx.accountId === 'ktc'
                                  ? 'bg-blue-500'
                                  : 'bg-secondary'
                              }`}
                            />
                            <span className="font-mono text-xs text-on-surface">
                              {tx.accountId === 'scb'
                                ? 'SCB (ออมทรัพย์)'
                                : tx.accountId === 'kbank'
                                ? 'KBank'
                                : tx.accountId === 'ktc'
                                ? 'บัตรเครดิต KTC'
                                : 'เงินสด'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                          {tx.date === new Date().toISOString().slice(0, 10)
                            ? `วันนี้, ${tx.time} น.`
                            : `${tx.date}, ${tx.time} น.`}
                        </td>

                        <td
                          className={`py-3.5 px-4 text-right font-mono font-semibold text-sm ${
                            isInc ? 'text-tertiary' : isExp ? 'text-error' : 'text-primary'
                          }`}
                        >
                          {isInc ? '+' : isExp ? '-' : ''}฿
                          {tx.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setTxToDelete(tx)}
                            className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error/15 transition-colors cursor-pointer"
                            title="ลบรายการนี้"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* In-App Delete Confirmation Modal (Native UI - No window.confirm) */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-outline-variant/40 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-on-surface font-headline">ยืนยันการลบรายการ</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  คุณต้องการลบรายการนี้ออกจากระบบใช่หรือไม่? ยอดคงเหลือในบัญชีและงบประมาณจะถูกปรับคืนอัตโนมัติ
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">รายการ:</span>
                <span className="font-semibold text-on-surface truncate max-w-[180px]">{txToDelete.note}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">จำนวนเงิน:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    txToDelete.type === 'income' ? 'text-tertiary' : 'text-error'
                  }`}
                >
                  {txToDelete.type === 'income' ? '+' : '-'}฿
                  {txToDelete.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
                <span>บัญชี / วันที่:</span>
                <span className="font-mono">
                  {txToDelete.accountId.toUpperCase()} • {txToDelete.date} ({txToDelete.time} น.)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-medium hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTransaction(txToDelete.id);
                  setDeleteToast(`ลบรายการ "${txToDelete.note}" สำเร็จแล้ว`);
                  setTxToDelete(null);
                  setTimeout(() => setDeleteToast(null), 3500);
                }}
                className="flex-1 py-2.5 rounded-xl bg-error text-white font-semibold text-xs hover:bg-error/90 shadow-md shadow-error/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>ยืนยันการลบ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {deleteToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-high text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-outline-variant/40 flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span className="font-medium">{deleteToast}</span>
          <button
            type="button"
            onClick={() => setDeleteToast(null)}
            className="ml-2 text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
};
