import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CategoryBudget, CategoryId, SavingsGoal } from '../types';

export const BudgetsView: React.FC = () => {
  const { budgets, goals, updateBudget, addBudget, depositToGoal, addGoal, deleteGoal, exportCsv } = useFinance();

  const [period, setPeriod] = useState<'month' | 'q1' | 'year'>('month');

  // Modal states
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
  const [selectedBudgetForEdit, setSelectedBudgetForEdit] = useState<CategoryBudget | null>(null);
  const [newAllocatedAmount, setNewAllocatedAmount] = useState('');

  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('ทั่วไป');

  // Overall calculations
  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const remaining = Math.max(0, totalAllocated - totalSpent);
  const overallPct = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForDeposit) return;
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) return;

    depositToGoal(selectedGoalForDeposit.id, num);
    setIsDepositModalOpen(false);
    setSelectedGoalForDeposit(null);
  };

  const handleBudgetUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetForEdit) return;
    const num = parseFloat(newAllocatedAmount);
    if (isNaN(num) || num <= 0) return;

    updateBudget(selectedBudgetForEdit.categoryId, num);
    setIsEditBudgetModalOpen(false);
    setSelectedBudgetForEdit(null);
  };

  const handleCreateNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newGoalTarget);
    if (isNaN(num) || num <= 0 || !newGoalName.trim()) return;

    addGoal({
      name: newGoalName.trim(),
      category: newGoalCategory,
      currentAmount: 0,
      targetAmount: num,
      priority: 'medium',
      priorityLabel: 'ปานกลาง',
      description: 'เป้าหมายที่สร้างขึ้นใหม่',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBOOc-NMWbTc_ymfmOHSp_aCJQODjm49qrnijQiIgPuKkjoXkABgBtMGkg1uxg9el4boh9ozd_jYadTunyfy-L-vKit1XbDUhcHb8HBSGekf4f1ReyKLkXiMQoy1L7Na8u57QwRA_koAezubbFIosIlCug-x9m41efvENd2gmhXVSV0SD-6UrR99uujV4N6HLuo173UGCczAayOWaTB-RqvL1G9Jb7UoJmDD-siogIr_tMSUOac3yfu',
      imageAlt: newGoalName,
    });
    setIsNewGoalModalOpen(false);
    setNewGoalName('');
    setNewGoalTarget('30000');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 space-y-8">
        {/* Top Context & Period Controls */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>รอบบัญชีปัจจุบัน • มีนาคม 2568</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight mt-1">
              งบประมาณและเป้าหมายเงินออม
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs">
              <button
                type="button"
                onClick={() => setPeriod('month')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  period === 'month' ? 'bg-surface-container-high text-on-surface font-semibold' : 'text-on-surface-variant'
                }`}
              >
                เดือนนี้
              </button>
              <button
                type="button"
                onClick={() => setPeriod('q1')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  period === 'q1' ? 'bg-surface-container-high text-on-surface font-semibold' : 'text-on-surface-variant'
                }`}
              >
                ไตรมาส 1
              </button>
              <button
                type="button"
                onClick={() => setPeriod('year')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  period === 'year' ? 'bg-surface-container-high text-on-surface font-semibold' : 'text-on-surface-variant'
                }`}
              >
                ทั้งปี 2568
              </button>
            </div>

            <button
              onClick={exportCsv}
              type="button"
              className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl transition-colors border border-outline-variant/30 cursor-pointer"
              title="ส่งออกรายงานงบประมาณ (.CSV)"
            >
              <span className="material-symbols-outlined text-[20px]">file_download</span>
            </button>
          </div>
        </section>

        {/* Central Hero: Big Circular Gauge & Performance Tiles */}
        <section className="bg-surface-container rounded-2xl p-6 lg:p-8 shadow-xl border border-outline-variant/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Gauge Hero (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="42" stroke="#18181b" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="42"
                    stroke="#a78bfa"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * overallPct) / 100}
                    strokeLinecap="round"
                    strokeWidth="8"
                    className="transition-all duration-1000"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-mono text-on-surface-variant">ใช้งบไปแล้ว</span>
                  <span className="text-4xl font-headline font-bold text-on-surface tracking-tight">
                    {overallPct}%
                  </span>
                  <span className="text-xs font-mono text-tertiary mt-0.5">
                    เหลือ ฿{remaining.toLocaleString('th-TH')}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-on-surface">
                  ฿{totalSpent.toLocaleString('th-TH')} / ฿{totalAllocated.toLocaleString('th-TH')}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  งบประมาณรวมประจำเดือนมีนาคม 2568
                </p>
              </div>
            </div>

            {/* Performance Tiles (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant block">งบเฉลี่ยคงเหลือ/วัน</span>
                  <span className="text-lg font-headline font-bold text-on-surface mt-1 block">
                    ฿{(remaining > 0 ? remaining / 12 : 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                    12 วันที่เหลือในรอบบัญชี
                  </span>
                </div>

                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant block">ใช้จ่ายเฉลี่ยที่ผ่านมา</span>
                  <span className="text-lg font-headline font-bold text-on-surface mt-1 block">
                    ฿{(totalSpent > 0 ? totalSpent / 18 : 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-tertiary mt-0.5 block">
                    0.0% จากสัปดาห์ก่อน
                  </span>
                </div>

                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant block">คาดการณ์สิ้นเดือน</span>
                  <span className="text-lg font-headline font-bold text-tertiary mt-1 block">
                    ฿{totalSpent.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                    อยู่ในกรอบงบประมาณ
                  </span>
                </div>
              </div>

              {/* Discipline Score Row */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {totalAllocated === 0 ? '100' : Math.max(0, 100 - overallPct)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-on-surface block">
                      คะแนนวินัยการเงิน (Financial Discipline Score)
                    </span>
                    <span className="text-xs text-tertiary block">
                      {totalAllocated === 0
                        ? 'สถานะเริ่มต้นใหม่ — พร้อมสำหรับการตั้งงบประมาณและบันทึกเงินออม'
                        : 'ยอดเยี่ยม — รักษาวินัยการออมและการคุมงบสม่ำเสมอ'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (budgets.length > 0) {
                      setSelectedBudgetForEdit(budgets[0]);
                      setNewAllocatedAmount(budgets[0].allocated.toString());
                      setIsEditBudgetModalOpen(true);
                    }
                  }}
                  className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-colors cursor-pointer"
                >
                  ปรับเกณฑ์งบ
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Budgets Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">
                งบประมาณแยกตามหมวดหมู่ (Category Allocations)
              </h2>
              <p className="text-xs text-on-surface-variant">
                ติดตามเพดานการใช้จ่ายในแต่ละกลุ่มเพื่อป้องกันการใช้จ่ายเกินจำเป็น
              </p>
            </div>
            <button
              onClick={() => {
                if (budgets.length > 0) {
                  setSelectedBudgetForEdit(budgets[0]);
                  setNewAllocatedAmount(budgets[0].allocated.toString());
                  setIsEditBudgetModalOpen(true);
                }
              }}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              + ตั้งงบประมาณหมวดใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const pct = b.allocated > 0 ? Math.min(100, Math.round((b.spent / b.allocated) * 100)) : 0;
              const isOver = pct >= 90;
              const isWarning = pct >= 80 && pct < 90;

              return (
                <div
                  key={b.categoryId}
                  className="bg-surface-container rounded-xl p-5 shadow-sm border border-outline-variant/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isOver
                            ? 'bg-error-container text-error'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-surface-container-high text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-on-surface">{b.name}</h3>
                          {b.isFixed && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                              คงที่ (Fixed)
                            </span>
                          )}
                          {isOver && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-error-container text-error font-medium">
                              ใกล้เต็มงบ!
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{b.notes}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBudgetForEdit(b);
                        setNewAllocatedAmount(b.allocated.toString());
                        setIsEditBudgetModalOpen(true);
                      }}
                      className="p-1.5 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-container-high cursor-pointer transition-colors"
                      title="แก้ไขงบ"
                    >
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-on-surface font-semibold">
                        ฿{b.spent.toLocaleString('th-TH')} / ฿{b.allocated.toLocaleString('th-TH')}
                      </span>
                      <span className={isOver ? 'text-error font-bold' : 'text-on-surface-variant'}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-error' : isWarning ? 'bg-amber-400' : 'bg-primary'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Savings Goals & Buckets Section with Hotlinked Visuals */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">
                เป้าหมายเงินออม & กองทุนสำรอง (Savings Goals)
              </h2>
              <p className="text-xs text-on-surface-variant">
                สะสมเงินทุนเพื่อความมั่นคงและแผนการใช้ชีวิตในอนาคต
              </p>
            </div>
            <button
              onClick={() => setIsNewGoalModalOpen(true)}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              + เพิ่มเป้าหมายใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

              return (
                <div
                  key={g.id}
                  className="bg-surface-container rounded-xl overflow-hidden shadow-lg border border-outline-variant/30 flex flex-col justify-between group"
                >
                  {/* Visual Hotlinked Image Banner */}
                  <div className="relative h-40 w-full overflow-hidden bg-surface-container-low">
                    <img
                      src={g.imageUrl}
                      alt={g.imageAlt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/30 to-transparent" />
                    <button
                      type="button"
                      onClick={() => setGoalToDelete(g)}
                      className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-black/60 hover:bg-error/80 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                      title="ลบเป้าหมายนี้"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-medium text-white border border-white/10">
                      {g.priorityLabel}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant">
                        <span className="font-mono uppercase text-primary font-semibold">{g.category}</span>
                        <span className="font-mono text-tertiary font-bold">{pct}%</span>
                      </div>
                      <h3 className="text-base font-semibold text-on-surface mt-1">{g.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{g.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-on-surface font-semibold">
                          ฿{g.currentAmount.toLocaleString('th-TH')}
                        </span>
                        <span className="text-on-surface-variant">
                          / ฿{g.targetAmount.toLocaleString('th-TH')}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-tertiary h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGoalForDeposit(g);
                            setIsDepositModalOpen(true);
                          }}
                          className="w-full py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-tertiary">
                            add_circle
                          </span>
                          <span>ฝากเงินเข้าเป้าหมาย</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 50/30/20 Rule Financial Architecture Blueprint */}
        <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]">architecture</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">โมเดลจัดสรรสัดส่วน 50 / 30 / 20</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                รายจ่ายจำเป็น (Needs) 50% • ความสุขและไลฟ์สไตล์ (Wants) 30% • การออมและลงทุน (Savings) 20%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono shrink-0">
            <span className="text-sky-400">Needs 48%</span>
            <span>•</span>
            <span className="text-pink-400">Wants 16%</span>
            <span>•</span>
            <span className="text-tertiary font-bold">Savings 36%</span>
          </div>
        </section>
      </div>

      {/* Deposit to Goal Modal */}
      {isDepositModalOpen && selectedGoalForDeposit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <div>
                <span className="text-[10px] text-tertiary font-mono font-bold uppercase">DEPOSIT</span>
                <h3 className="text-base font-bold text-on-surface">{selectedGoalForDeposit.name}</h3>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">
                  จำนวนเงินที่ต้องการฝากสะสม (฿)
                </label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-surface-container-low text-xl font-headline font-bold text-on-surface px-3 py-2.5 rounded-xl border border-outline-variant/30 font-mono focus:outline-none focus:ring-1 focus:ring-tertiary"
                />
              </div>

              <div className="flex items-center gap-2">
                {['1000', '2000', '5000', '10000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="flex-1 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-xs font-mono cursor-pointer"
                  >
                    +{parseInt(amt) >= 1000 ? `${parseInt(amt) / 1000}k` : amt}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-tertiary text-on-tertiary font-semibold text-xs cursor-pointer shadow-md shadow-tertiary/20"
                >
                  ยืนยันการฝาก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Threshold Modal */}
      {isEditBudgetModalOpen && selectedBudgetForEdit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <h3 className="text-base font-bold text-on-surface">ปรับงบ: {selectedBudgetForEdit.name}</h3>
              <button
                onClick={() => setIsEditBudgetModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleBudgetUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">
                  กำหนดเพดานงบประมาณใหม่ (฿)
                </label>
                <input
                  type="number"
                  step="500"
                  min="500"
                  required
                  value={newAllocatedAmount}
                  onChange={(e) => setNewAllocatedAmount(e.target.value)}
                  className="w-full bg-surface-container-low text-xl font-headline font-bold text-on-surface px-3 py-2.5 rounded-xl border border-outline-variant/30 font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditBudgetModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs cursor-pointer shadow-md"
                >
                  บันทึกงบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {isNewGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <h3 className="text-base font-bold text-on-surface">สร้างเป้าหมายเงินออมใหม่</h3>
              <button
                onClick={() => setIsNewGoalModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-on-surface-variant mb-1">ชื่อเป้าหมาย</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ซื้อกล้อง Sony A7, ทริปสวิส..."
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg border border-outline-variant/30"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">เป้าหมายจำนวนเงิน (฿)</label>
                <input
                  type="number"
                  step="1000"
                  min="1000"
                  required
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg border border-outline-variant/30 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">หมวดหมู่</label>
                <input
                  type="text"
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg border border-outline-variant/30"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewGoalModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-medium cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs cursor-pointer shadow-md"
                >
                  สร้างเป้าหมาย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Goal In-App Confirmation Modal */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-outline-variant/40 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-on-surface font-headline">ยืนยันการลบเป้าหมาย</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  คุณต้องการลบเป้าหมายการออมนี้ใช่หรือไม่?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">เป้าหมาย:</span>
                <span className="font-semibold text-on-surface truncate max-w-[180px]">{goalToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">ยอดสะสม / ยอดเป้าหมาย:</span>
                <span className="font-mono font-bold text-tertiary">
                  ฿{goalToDelete.currentAmount.toLocaleString('th-TH')} / ฿{goalToDelete.targetAmount.toLocaleString('th-TH')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGoalToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-medium hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteGoal(goalToDelete.id);
                  setGoalToDelete(null);
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
    </div>
  );
};
