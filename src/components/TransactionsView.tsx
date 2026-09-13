import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AccountId, CategoryId, Transaction, TransactionType } from '../types';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    exportCsv,
    categories,
    accounts,
    stats,
  } = useFinance();

  // Fast Dispatch form state
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [amountVal, setAmountVal] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryId>('food');
  const [selectedAccount, setSelectedAccount] = useState<AccountId>('scb');
  const [dateVal, setDateVal] = useState(new Date().toISOString().slice(0, 10));
  const [timeVal, setTimeVal] = useState('12:00');
  const [memoVal, setMemoVal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [accFilter, setAccFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Editing modal state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // In-app Delete Confirmation Modal (avoids iframe window.confirm block)
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  const selectedCategoryObj = useMemo(
    () => categories.find((c) => c.id === selectedCat),
    [categories, selectedCat]
  );

  const handleResetForm = () => {
    setAmountVal('');
    setMemoVal('');
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amountVal.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addTransaction({
        type: txType,
        amount: num,
        categoryId: selectedCat,
        accountId: selectedAccount,
        date: dateVal,
        time: timeVal,
        note: memoVal.trim() || (txType === 'income' ? 'รายรับ' : 'รายจ่าย'),
      });
      setIsSubmitting(false);
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 3000);
    }, 400);
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNote = tx.note.toLowerCase().includes(q);
        const matchesSubNote = tx.subNote ? tx.subNote.toLowerCase().includes(q) : false;
        const matchesCat = (tx.categoryName || tx.categoryId).toLowerCase().includes(q);
        const matchesAmount = tx.amount.toString().includes(q);
        if (!matchesNote && !matchesSubNote && !matchesCat && !matchesAmount) {
          return false;
        }
      }

      // Category filter
      if (catFilter !== 'all') {
        if (catFilter === 'income' && tx.type !== 'income') return false;
        if (catFilter !== 'income' && tx.categoryId !== catFilter) return false;
      }

      // Account filter
      if (accFilter !== 'all' && tx.accountId !== accFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, catFilter, accFilter]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filteredTransactions.forEach((tx) => {
      const d = tx.date;
      if (!groups[d]) groups[d] = [];
      groups[d].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));
  }, [groupedTransactions]);

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8">
        {/* Top Context & Stat Ticker Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-surface-container rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between text-on-surface-variant text-xs font-label">
              <span>สรุปสุทธิเดือนนี้</span>
              <span className="material-symbols-outlined text-[16px] text-tertiary">trending_up</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-headline font-bold text-on-surface tracking-tight">
                {stats.netSurplus >= 0 ? '+' : '-'}฿{Math.abs(stats.netSurplus).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] font-medium text-tertiary bg-tertiary-container/30 px-1.5 py-0.5 rounded">
                {stats.savingsRate}%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-on-surface-variant truncate">
              {stats.netSurplus === 0 ? 'ยังไม่มีรายรับ-รายจ่ายในรอบนี้' : `เงินออมสุทธิ ฿${stats.netSurplus.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-4 shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between text-on-surface-variant text-xs font-label">
              <span>รายจ่ายสะสม</span>
              <span className="material-symbols-outlined text-[16px] text-error">trending_down</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-headline font-bold text-on-surface tracking-tight">
                ฿{stats.monthExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-on-surface-variant">/ ฿{stats.budgetTotal.toLocaleString('th-TH')} งบ</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
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

          <div className="bg-surface-container rounded-xl p-4 shadow-sm flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between text-on-surface-variant text-xs font-label">
              <span>รายรับเข้าทั้งหมด</span>
              <span className="material-symbols-outlined text-[16px] text-tertiary">account_balance_wallet</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-headline font-bold text-tertiary tracking-tight">
                ฿{stats.monthIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-on-surface-variant">
              {stats.monthIncome === 0 ? 'ยังไม่มีรายรับในรอบนี้ (฿0.00)' : 'เงินเดือน, เงินปันผล, ฟรีแลนซ์'}
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-4 shadow-sm flex items-center justify-between border border-outline-variant/30">
            <div>
              <span className="text-xs text-on-surface-variant font-label block">สถานะบัญชีหลัก</span>
              <span className="text-sm font-semibold text-on-surface mt-1 block">SCB ออมทรัพย์ดิจิทัล</span>
              <span className="text-lg font-headline font-bold text-primary mt-0.5 block">
                ฿{(accounts.find((a) => a.id === 'scb')?.balance || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">credit_card</span>
            </div>
          </div>
        </div>

        {/* Main Dual Panel: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Fast Entry Module (5 Cols) */}
          <section className="lg:col-span-5 bg-surface-container rounded-2xl p-6 lg:p-7 shadow-md sticky top-24 border border-outline-variant/30">
            <div className="flex items-center justify-between pb-5 border-b border-outline-variant/40">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-mono text-primary font-bold">
                  FAST DISPATCH
                </span>
                <h2 className="text-xl font-headline font-bold tracking-tight text-on-surface mt-0.5">
                  บันทึกรายการใหม่
                </h2>
              </div>
              <button
                onClick={handleResetForm}
                type="button"
                className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span> ล้างฟอร์ม
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="mt-6 space-y-5">
              {/* Type Segment Picker */}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-2">ประเภทรายการ</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container-lowest rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                      txType === 'expense'
                        ? 'bg-error/15 text-error shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">arrow_outward</span>
                    รายจ่าย
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`py-2 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                      txType === 'income'
                        ? 'bg-tertiary-container/40 text-tertiary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">south_west</span>
                    รายรับ
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('transfer')}
                    className={`py-2 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                      txType === 'transfer'
                        ? 'bg-primary/20 text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">sync_alt</span>
                    โอนย้าย
                  </button>
                </div>
              </div>

              {/* Grand Amount Display Input */}
              <div className="bg-surface-container-low p-4 rounded-xl shadow-inner border border-outline-variant/30">
                <div className="flex justify-between items-center text-xs text-on-surface-variant mb-1">
                  <span className="font-mono">AMOUNT</span>
                  <span
                    className={`text-[11px] font-medium ${
                      txType === 'income' ? 'text-tertiary' : txType === 'expense' ? 'text-error' : 'text-primary'
                    }`}
                  >
                    {txType === 'income' ? 'ระบุยอดรายรับ' : txType === 'expense' ? 'ระบุยอดรายจ่าย' : 'ระบุยอดโอน'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold font-headline text-on-surface-variant select-none">฿</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amountVal}
                    onChange={(e) => setAmountVal(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-3xl lg:text-4xl font-headline font-bold text-on-surface focus:outline-none tracking-tight placeholder:text-outline-variant"
                  />
                </div>

                {/* Quick Chips */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-outline-variant/30 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] text-on-surface-variant mr-1 font-mono">+ด่วน:</span>
                  {['50', '100', '500', '1,000.00', '5,000.00'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAmountVal(chip)}
                      className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-mono text-[11px] transition-colors cursor-pointer"
                    >
                      {chip === '1,000.00' ? '1K' : chip === '5,000.00' ? '5K' : chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-on-surface-variant">เลือกหมวดหมู่</label>
                  <span className="text-xs font-mono text-primary font-medium">
                    {selectedCategoryObj?.name || 'อาหาร & เครื่องดื่ม'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'food', name: 'อาหาร', icon: 'restaurant' },
                    { id: 'commute', name: 'เดินทาง', icon: 'directions_subway' },
                    { id: 'shopping', name: 'ช้อปปิ้ง', icon: 'shopping_bag' },
                    { id: 'utilities', name: 'ค่าน้ำไฟ', icon: 'bolt' },
                    { id: 'salary', name: 'เงินเดือน', icon: 'payments' },
                    { id: 'freelance', name: 'ฟรีแลนซ์', icon: 'laptop_mac' },
                    { id: 'invest', name: 'ลงทุน', icon: 'show_chart' },
                    { id: 'other', name: 'อื่นๆ', icon: 'more_horiz' },
                  ].map((cat) => {
                    const isSelected = selectedCat === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCat(cat.id as CategoryId)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-surface-container-high text-primary ring-1 ring-primary/40'
                            : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                        <span className="text-[11px] mt-1 font-medium truncate w-full text-center">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account Source Selection */}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-2">หัก/เข้า บัญชี</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'scb', name: 'ออมทรัพย์', sub: 'SCB ••4820', icon: 'savings' },
                    { id: 'ktc', name: 'บัตรเครดิต', sub: 'KTC Visa ••9912', icon: 'credit_card' },
                    { id: 'cash', name: 'เงินสด', sub: 'กระเป๋าตังค์', icon: 'wallet' },
                  ].map((acc) => {
                    const isChecked = selectedAccount === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedAccount(acc.id as AccountId)}
                        className={`p-2.5 rounded-xl transition-all text-left cursor-pointer border ${
                          isChecked
                            ? 'bg-primary/10 text-primary border-primary/50'
                            : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base block mb-1">{acc.icon}</span>
                        <span className="text-xs font-semibold block text-on-surface">{acc.name}</span>
                        <span className="text-[10px] text-on-surface-variant block truncate">{acc.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                    วันที่ทำรายการ
                  </label>
                  <input
                    type="date"
                    value={dateVal}
                    onChange={(e) => setDateVal(e.target.value)}
                    className="w-full bg-surface-container-lowest text-xs text-on-surface px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary appearance-none font-mono border border-outline-variant/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1.5">เวลา</label>
                  <input
                    type="time"
                    value={timeVal}
                    onChange={(e) => setTimeVal(e.target.value)}
                    className="w-full bg-surface-container-lowest text-xs text-on-surface px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary appearance-none font-mono border border-outline-variant/30"
                  />
                </div>
              </div>

              {/* Memo / Notes */}
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  บันทึกช่วยจำ (Memo)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={memoVal}
                    onChange={(e) => setMemoVal(e.target.value)}
                    placeholder="เช่น มื้อเที่ยงกับทีม, กาแฟดำ, เติมน้ำมัน..."
                    className="w-full bg-surface-container-lowest text-xs text-on-surface placeholder:text-outline-variant px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                  />
                  <span className="absolute right-3 top-2.5 material-symbols-outlined text-[16px] text-on-surface-variant">
                    edit_note
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed-dim active:scale-[0.99] font-headline font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[19px] animate-spin">sync</span>
                      <span>กำลังบันทึกข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[19px]">check_circle</span>
                      <span>บันทึกรายการ (Save Transaction)</span>
                    </>
                  )}
                </button>

                {showSavedFeedback && (
                  <div className="text-center text-xs text-tertiary mt-2 transition-all">
                    ✓ บันทึกรายการเข้าบัญชีเรียบร้อยแล้ว
                  </div>
                )}
              </div>
            </form>
          </section>

          {/* RIGHT: Transaction History & Filter Matrix (7 Cols) */}
          <section className="lg:col-span-7 space-y-6">
            {/* Action Bar: Search, Filters & Export */}
            <div className="bg-surface-container rounded-2xl p-5 shadow-sm space-y-4 border border-outline-variant/30">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search bar */}
                <div className="relative flex-1">
                  <span className="material-symbols-outlined text-on-surface-variant absolute left-3.5 top-2.5 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาตามโน้ต, หมวดหมู่, หรือจำนวนเงิน..."
                    className="w-full bg-surface-container-lowest text-xs text-on-surface placeholder:text-outline-variant pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                  />
                </div>

                {/* Export CSV CTA */}
                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface hover:text-primary transition-colors whitespace-nowrap cursor-pointer border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[16px]">ios_share</span>
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/30">
                {/* Date range selector */}
                <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-xl text-xs border border-outline-variant/20">
                  {(['all', 'today', 'week', 'month'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeFilter(t)}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                        timeFilter === t
                          ? 'font-medium text-on-surface bg-surface-container-high shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {t === 'all' ? 'ทั้งหมด' : t === 'today' ? 'วันนี้' : t === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}
                    </button>
                  ))}
                </div>

                {/* Category filter dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={catFilter}
                    onChange={(e) => setCatFilter(e.target.value)}
                    className="bg-surface-container-lowest text-xs text-on-surface-variant px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-outline-variant/20"
                  >
                    <option value="all">ทุกหมวดหมู่</option>
                    <option value="food">อาหาร & เครื่องดื่ม</option>
                    <option value="commute">เดินทาง</option>
                    <option value="shopping">ช้อปปิ้ง</option>
                    <option value="utilities">บิลค่าน้ำไฟ</option>
                    <option value="income">รายรับทั้งหมด</option>
                  </select>

                  <select
                    value={accFilter}
                    onChange={(e) => setAccFilter(e.target.value)}
                    className="bg-surface-container-lowest text-xs text-on-surface-variant px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-outline-variant/20"
                  >
                    <option value="all">ทุกบัญชี</option>
                    <option value="scb">ออมทรัพย์ SCB</option>
                    <option value="ktc">บัตรเครดิต KTC</option>
                    <option value="cash">เงินสด</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grouped Transactions List */}
            <div className="space-y-6">
              {sortedDates.length === 0 ? (
                <div className="bg-surface-container rounded-xl p-10 text-center text-on-surface-variant space-y-3 border border-outline-variant/30">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">receipt_long</span>
                  </div>
                  <p className="text-base font-headline font-semibold text-on-surface">ยังไม่มีรายการธุรกรรมในระบบ (฿0.00)</p>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    ข้อมูลการเงินทั้งหมดถูกรีเซ็ตเป็น 0 เรียบร้อยแล้ว สามารถเริ่มบันทึกรายการรายรับ-รายจ่ายได้ทันทีผ่านแบบฟอร์มบันทึกด่วนด้านซ้าย
                  </p>
                </div>
              ) : (
                sortedDates.map((dateKey) => {
                  const txList = groupedTransactions[dateKey];
                  const netGroup = txList.reduce((acc, t) => {
                    return t.type === 'income' ? acc + t.amount : t.type === 'expense' ? acc - t.amount : acc;
                  }, 0);

                  // Date title formatting
                  let displayDate = dateKey;
                  if (dateKey === '2025-10-24') displayDate = 'วันนี้ — 24 ตุลาคม 2025';
                  else if (dateKey === '2025-10-23') displayDate = 'เมื่อวาน — 23 ตุลาคม 2025';
                  else if (dateKey === '2025-10-20') displayDate = '20 ตุลาคม 2025';

                  return (
                    <div key={dateKey} className="space-y-2.5">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-headline font-bold text-on-surface uppercase tracking-wider">
                            {displayDate}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                            {txList.length} รายการ
                          </span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-on-surface-variant">
                          สุทธิ:{' '}
                          <span
                            className={`font-headline ${
                              netGroup >= 0 ? 'text-tertiary' : 'text-error'
                            }`}
                          >
                            {netGroup >= 0 ? '+' : '-'}฿
                            {Math.abs(netGroup).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        </span>
                      </div>

                      {/* Items */}
                      {txList.map((item) => {
                        const isExp = item.type === 'expense';
                        const isInc = item.type === 'income';
                        const isTrans = item.type === 'transfer';

                        return (
                          <div
                            key={item.id}
                            className="bg-surface-container hover:bg-surface-container-high rounded-xl p-3.5 transition-all duration-150 flex items-center justify-between group shadow-sm border border-outline-variant/20"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center flex-shrink-0 ${
                                  isInc
                                    ? 'text-tertiary'
                                    : isExp
                                    ? 'text-error'
                                    : 'text-primary'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {item.categoryId === 'food'
                                    ? 'restaurant'
                                    : item.categoryId === 'commute'
                                    ? 'directions_subway'
                                    : item.categoryId === 'shopping'
                                    ? 'shopping_bag'
                                    : item.categoryId === 'utilities'
                                    ? 'bolt'
                                    : item.categoryId === 'freelance'
                                    ? 'laptop_mac'
                                    : item.categoryId === 'salary'
                                    ? 'payments'
                                    : item.type === 'transfer'
                                    ? 'sync_alt'
                                    : 'credit_card'}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-on-surface truncate">
                                    {item.note}
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant font-mono bg-surface-container-lowest px-1.5 py-0.5 rounded">
                                    {item.categoryName || item.categoryId}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                                  <span>{item.time} น.</span>
                                  <span>•</span>
                                  <span>
                                    {item.subNote ||
                                      (item.accountId === 'scb'
                                        ? 'SCB ออมทรัพย์ดิจิทัล'
                                        : item.accountId === 'ktc'
                                        ? 'บัตรเครดิต KTC'
                                        : 'เงินสด')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <span
                                  className={`text-sm font-headline font-bold tracking-tight block ${
                                    isInc ? 'text-tertiary' : isExp ? 'text-error' : 'text-on-surface'
                                  }`}
                                >
                                  {isInc ? '+' : isExp ? '-' : ''}฿
                                  {item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </span>
                                <span className="text-[10px] text-on-surface-variant font-mono">
                                  {isInc ? 'รับเข้าแล้ว' : isTrans ? 'โอนภายใน' : 'สำเร็จ'}
                                </span>
                              </div>

                              {/* Row Action Buttons */}
                              <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => setEditingTx(item)}
                                  className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer"
                                  title="แก้ไขรายการ"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTxToDelete(item)}
                                  className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error/15 transition-colors cursor-pointer"
                                  title="ลบรายการ"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination & List Meta */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant border-t border-outline-variant/30">
              <div>
                กำลังแสดง{' '}
                <span className="font-mono text-on-surface">
                  {filteredTransactions.length > 0 ? `1 - ${filteredTransactions.length}` : '0'}
                </span>{' '}
                จากทั้งหมด <span className="font-mono text-on-surface">{transactions.length}</span> รายการ
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40 cursor-pointer"
                >
                  ก่อนหน้า
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className={`px-3 py-1.5 rounded-lg ${
                    currentPage === 1 ? 'bg-primary text-on-primary font-medium' : 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className={`px-3 py-1.5 rounded-lg ${
                    currentPage === 2 ? 'bg-primary text-on-primary font-medium' : 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(3)}
                  className={`px-3 py-1.5 rounded-lg ${
                    currentPage === 3 ? 'bg-primary text-on-primary font-medium' : 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  3
                </button>
                <span className="px-1 text-on-surface-variant font-mono">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="text-base font-bold text-on-surface">แก้ไขรายการ</h3>
              <button
                onClick={() => setEditingTx(null)}
                className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-on-surface-variant mb-1">บันทึกช่วยจำ (Memo)</label>
                <input
                  type="text"
                  value={editingTx.note}
                  onChange={(e) => setEditingTx({ ...editingTx, note: e.target.value })}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg border border-outline-variant/30"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">จำนวนเงิน (฿)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingTx.amount}
                  onChange={(e) => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg border border-outline-variant/30 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">หมวดหมู่</label>
                <select
                  value={editingTx.categoryId}
                  onChange={(e) => {
                    const cId = e.target.value as CategoryId;
                    const cObj = categories.find((c) => c.id === cId);
                    setEditingTx({
                      ...editingTx,
                      categoryId: cId,
                      categoryName: cObj?.name,
                    });
                  }}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-lg border border-outline-variant/30"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => {
                  const tx = editingTx;
                  setEditingTx(null);
                  setTxToDelete(tx);
                }}
                className="py-2 px-3 rounded-xl bg-error/15 text-error hover:bg-error/25 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>ลบรายการนี้</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTransaction(editingTx.id);
                    addTransaction(editingTx);
                    setEditingTx(null);
                    setDeleteToast('บันทึกการแก้ไขเรียบร้อยแล้ว');
                    setTimeout(() => setDeleteToast(null), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold cursor-pointer shadow hover:bg-primary-fixed-dim transition-colors"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
