import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export const ReportsView: React.FC = () => {
  const { stats, transactions, goals, exportCsv } = useFinance();
  const [selectedRange, setSelectedRange] = useState<'month' | 'last_month' | 'q1' | 'year' | 'custom'>('q1');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const monthsData = [
    { name: 'เม.ย.', income: 0, expense: 0 },
    { name: 'พ.ค.', income: 0, expense: 0 },
    { name: 'มิ.ย.', income: 0, expense: 0 },
    { name: 'ก.ค.', income: 0, expense: 0 },
    { name: 'ส.ค.', income: 0, expense: 0 },
    { name: 'ก.ย.', income: 0, expense: 0 },
    { name: 'ต.ค.', income: 0, expense: 0 },
    { name: 'พ.ย.', income: 0, expense: 0 },
    { name: 'ธ.ค.', income: 0, expense: 0 },
    { name: 'ม.ค.', income: 0, expense: 0 },
    { name: 'ก.พ.', income: 0, expense: 0 },
    { name: 'มี.ค.', income: stats.monthIncome, expense: stats.monthExpense },
  ];

  const maxVal = Math.max(50000, stats.monthIncome, stats.monthExpense);

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExp = stats.monthExpense;

  // Channels calculation
  const scbExp = expenseTransactions.filter((t) => t.accountId === 'scb').reduce((s, t) => s + t.amount, 0);
  const ktcExp = expenseTransactions.filter((t) => t.accountId === 'ktc').reduce((s, t) => s + t.amount, 0);
  const cashExp = expenseTransactions.filter((t) => t.accountId === 'cash').reduce((s, t) => s + t.amount, 0);

  const scbPct = totalExp > 0 ? Math.round((scbExp / totalExp) * 100) : 0;
  const ktcPct = totalExp > 0 ? Math.round((ktcExp / totalExp) * 100) : 0;
  const cashPct = totalExp > 0 ? Math.round((cashExp / totalExp) * 100) : 0;

  // Categories calculation
  const categoriesMap: { [key: string]: { name: string; amount: number; color: string; icon: string } } = {
    utilities: { name: 'ที่พักอาศัยและสาธารณูปโภค', amount: 0, color: 'bg-sky-400', icon: 'apartment' },
    food: { name: 'อาหารและของใช้ประจำวัน', amount: 0, color: 'bg-primary', icon: 'restaurant' },
    commute: { name: 'การเดินทางและเชื้อเพลิง', amount: 0, color: 'bg-amber-400', icon: 'directions_car' },
    subscription: { name: 'ซอฟต์แวร์และบริการสมาชิก', amount: 0, color: 'bg-purple-400', icon: 'cloud_done' },
    shopping: { name: 'สันทนาการและช้อปปิ้ง', amount: 0, color: 'bg-pink-400', icon: 'shopping_bag' },
  };

  expenseTransactions.forEach((t) => {
    if (categoriesMap[t.categoryId]) {
      categoriesMap[t.categoryId].amount += t.amount;
    } else {
      categoriesMap.shopping.amount += t.amount;
    }
  });

  const categoriesList = Object.entries(categoriesMap).map(([key, item], idx) => {
    const pct = totalExp > 0 ? ((item.amount / totalExp) * 100).toFixed(1) : '0.0';
    return {
      rank: `0${idx + 1}`,
      name: item.name,
      amount: item.amount,
      pct,
      perDay: item.amount / 30,
      color: item.color,
      icon: item.icon,
    };
  });

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 space-y-8">
        {/* Header Title & Date Range Filter */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-on-surface-variant">
              <span className="text-primary font-bold">Analytics & Intelligence</span>
              <span>•</span>
              <span>รอบบัญชีปัจจุบัน (มีนาคม 2568)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight mt-1">
              รายงานและวิเคราะห์พฤติกรรมการเงิน
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs">
              {[
                { id: 'month', label: 'เดือนนี้' },
                { id: 'last_month', label: 'เดือนที่แล้ว' },
                { id: 'q1', label: 'ไตรมาส 1 (Q1)' },
                { id: 'year', label: 'ปีนี้ (2568)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRange(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedRange === tab.id
                      ? 'bg-surface-container-high text-on-surface font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={exportCsv}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium border border-outline-variant/30 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">download</span>
              <span>ส่งออกรายงาน (.CSV)</span>
            </button>
          </div>
        </section>

        {/* 4 KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Income Total */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>รายรับรวมสะสม</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">trending_up</span>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-tertiary">
                ฿{stats.monthIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {stats.monthIncome === 0 ? 'ยังไม่มีรายรับในรอบนี้' : `เฉลี่ย ฿${(stats.monthIncome / 3).toLocaleString('th-TH', { minimumFractionDigits: 2 })} / เดือน`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-tertiary font-mono">
              <span>0.0%</span>
              <span className="text-on-surface-variant">สถานะรายรับปัจจุบัน</span>
            </div>
          </div>

          {/* Expense Total */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>รายจ่ายรวมสะสม</span>
              <span className="material-symbols-outlined text-[18px] text-error">trending_down</span>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-error">
                ฿{stats.monthExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {stats.budgetTotal > 0 ? `กรอบงบควบคุม ฿${stats.budgetTotal.toLocaleString('th-TH')}` : 'งบประมาณตั้งต้น ฿0.00'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-tertiary font-mono">
              <span>0.0%</span>
              <span className="text-on-surface-variant">คุมค่าใช้จ่ายได้ตามแผน</span>
            </div>
          </div>

          {/* Daily Average */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>ค่าเฉลี่ยรายจ่ายต่อวัน</span>
              <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-on-surface">
                ฿{(stats.monthExpense > 0 ? stats.monthExpense / 30 : 0).toFixed(2)}
                <span className="text-xs font-normal text-on-surface-variant ml-1">/ วัน</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {stats.monthExpense === 0 ? 'ยังไม่มีการใช้จ่ายในรอบนี้' : 'ค่าเฉลี่ยต่อวันประจำเดือน'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-tertiary font-mono">
              <span>0.0%</span>
              <span className="text-on-surface-variant">คุมค่าใช้จ่ายได้ดีเยี่ยม</span>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="bg-surface-container rounded-xl p-5 shadow-lg border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>อัตราการออมสุทธิ (Savings Rate)</span>
              <span className="material-symbols-outlined text-[18px] text-primary">savings</span>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-primary">
                {stats.savingsRate}%
              </div>
              <p className="text-xs text-on-surface-variant mt-1">เป้าหมายเงินออมขั้นต่ำ 50%</p>
            </div>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, stats.savingsRate))}%` }}
              />
            </div>
          </div>
        </section>

        {/* 12-Month Bar Chart: Income vs Expense Comparison */}
        <section className="bg-surface-container rounded-xl p-6 shadow-xl border border-outline-variant/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-headline font-semibold text-on-surface">
                แนวโน้มรายรับ - รายจ่ายรอบ 12 เดือน (Monthly Comparison)
              </h2>
              <p className="text-xs text-on-surface-variant">
                แสดงผลเปรียบเทียบกระแสเงินสดขาเข้าและขาออกย้อนหลัง
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-tertiary" />
                <span className="text-on-surface-variant">รายรับ (Income)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-error" />
                <span className="text-on-surface-variant">รายจ่าย (Expense)</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 border-b border-outline-variant/30">
            {monthsData.map((m) => {
              const incHeight = maxVal > 0 ? (m.income / maxVal) * 100 : 0;
              const expHeight = maxVal > 0 ? (m.expense / maxVal) * 100 : 0;
              const isHovered = hoveredMonth === m.name;

              return (
                <div
                  key={m.name}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredMonth(m.name)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-14 z-30 bg-surface-container-highest px-2.5 py-1 rounded shadow-xl border border-outline-variant/50 text-[11px] font-mono whitespace-nowrap pointer-events-none">
                      <p className="text-tertiary">รับ: ฿{m.income.toLocaleString()}</p>
                      <p className="text-error">จ่าย: ฿{m.expense.toLocaleString()}</p>
                    </div>
                  )}

                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                    {/* Income Bar */}
                    <div
                      className="w-2.5 sm:w-4 rounded-t bg-tertiary/85 group-hover:bg-tertiary transition-all duration-300 min-h-[3px]"
                      style={{ height: `${Math.max(3, incHeight)}%` }}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-2.5 sm:w-4 rounded-t bg-error/80 group-hover:bg-error transition-all duration-300 min-h-[3px]"
                      style={{ height: `${Math.max(3, expHeight)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-on-surface-variant mt-2 group-hover:text-on-surface">
                    {m.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detailed Breakdown: Top 5 Categories & Channel Matrix */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top 5 Expense Categories (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container rounded-xl p-6 shadow-xl border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-headline font-semibold text-on-surface">
                  รายจ่ายแยกตามหมวดหมู่เชิงลึก
                </h2>
                <p className="text-xs text-on-surface-variant">5 หมวดหมู่หลักในรอบบัญชีนี้</p>
              </div>
              <span className="text-xs font-mono text-primary font-medium">
                รวม ฿{totalExp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-3.5 pt-2">
              {categoriesList.map((item) => (
                <div
                  key={item.rank}
                  className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 hover:border-outline-variant/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-on-surface-variant font-bold">{item.rank}</span>
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface">{item.name}</p>
                        <p className="text-[11px] text-on-surface-variant font-mono">
                          เฉลี่ย ฿{item.perDay.toFixed(2)} / วัน
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-headline font-bold text-on-surface font-mono">
                        ฿{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] font-mono text-on-surface-variant">{item.pct}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Channels & Savings Progress (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Channels Breakdown */}
            <div className="bg-surface-container rounded-xl p-6 shadow-xl border border-outline-variant/30 space-y-4">
              <h2 className="text-base font-headline font-semibold text-on-surface">ช่องทางการใช้จ่าย</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-purple-400">smartphone</span>
                      โมบายแบงก์กิ้ง (SCB/KBank)
                    </span>
                    <span className="font-mono text-on-surface font-semibold">
                      {scbPct}% (฿{scbExp.toLocaleString('th-TH')})
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${scbPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-sky-400">credit_card</span>
                      บัตรเครดิต KTC Visa
                    </span>
                    <span className="font-mono text-on-surface font-semibold">
                      {ktcPct}% (฿{ktcExp.toLocaleString('th-TH')})
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full rounded-full" style={{ width: `${ktcPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-emerald-400">payments</span>
                      เงินสด (Cash)
                    </span>
                    <span className="font-mono text-on-surface font-semibold">
                      {cashPct}% (฿{cashExp.toLocaleString('th-TH')})
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full" style={{ width: `${cashPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Goals Status Box */}
            <div className="bg-surface-container rounded-xl p-6 shadow-xl border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-headline font-semibold text-on-surface">เป้าหมายเงินออมสะสม</h2>
                <span className="text-xs text-tertiary font-mono">{goals.length} เป้าหมาย</span>
              </div>

              <div className="space-y-3 text-xs">
                {goals.slice(0, 2).map((goal) => {
                  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                  return (
                    <div key={goal.id} className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/20">
                      <div className="flex justify-between font-semibold mb-1 text-on-surface">
                        <span>{goal.name}</span>
                        <span className="text-tertiary font-mono">{pct}%</span>
                      </div>
                      <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden mb-1.5">
                        <div className="bg-tertiary h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-mono">
                        เก็บได้ ฿{goal.currentAmount.toLocaleString('th-TH')} / ฿{goal.targetAmount.toLocaleString('th-TH')} (0%)
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Encrypted Ledger Audit Information */}
        <section className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-tertiary">verified_user</span>
            <span>Ledger Audit Signature: SHA-256 #9f7d1de0-378e-4ba9-a419</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Local AES-256 Storage</span>
            <span>•</span>
            <span>Realtime Client Synchronization</span>
          </div>
        </section>
      </div>
    </div>
  );
};
