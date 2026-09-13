import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types';

export type ChartPeriod = '7days' | '4weeks' | '12months';

interface BarDataPoint {
  id: string;
  label: string;
  subLabel: string;
  fullDateLabel: string;
  income: number;
  expense: number;
  net: number;
  txCount: number;
  transactions: Transaction[];
}

export const CashflowBarChart: React.FC = () => {
  const { transactions, stats } = useFinance();
  const [period, setPeriod] = useState<ChartPeriod>('7days');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate dynamic bar data based on actual transactions
  const chartData: BarDataPoint[] = useMemo(() => {
    const now = new Date();

    if (period === '7days') {
      const days: BarDataPoint[] = [];
      const thaiDayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      const thaiMonthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;

        const isToday = i === 0;
        const isYesterday = i === 1;

        const dayName = thaiDayNames[d.getDay()];
        const monthName = thaiMonthNames[d.getMonth()];

        const label = isToday ? 'วันนี้' : isYesterday ? 'เมื่อวาน' : `${dayName} ${d.getDate()}`;
        const subLabel = `${d.getDate()} ${monthName}`;
        const fullDateLabel = `${dayName}ที่ ${d.getDate()} ${monthName} ${d.getFullYear() + 543}`;

        const dayTxs = transactions.filter((t) => t.date === dateStr);
        const income = dayTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = dayTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        days.push({
          id: dateStr,
          label,
          subLabel,
          fullDateLabel,
          income,
          expense,
          net: income - expense,
          txCount: dayTxs.length,
          transactions: dayTxs,
        });
      }
      return days;
    }

    if (period === '4weeks') {
      const weeks: BarDataPoint[] = [];
      for (let w = 3; w >= 0; w--) {
        const endDay = new Date();
        endDay.setDate(now.getDate() - w * 7);
        const startDay = new Date();
        startDay.setDate(endDay.getDate() - 6);

        const startStr = startDay.toISOString().slice(0, 10);
        const endStr = endDay.toISOString().slice(0, 10);

        const label = w === 0 ? 'สัปดาห์นี้' : w === 1 ? 'สัปดาห์ที่แล้ว' : `สัปดาห์ -${w}`;
        const subLabel = `${startDay.getDate()}/${startDay.getMonth() + 1} - ${endDay.getDate()}/${endDay.getMonth() + 1}`;
        const fullDateLabel = `ช่วง ${startDay.getDate()}/${startDay.getMonth() + 1} ถึง ${endDay.getDate()}/${endDay.getMonth() + 1}`;

        const weekTxs = transactions.filter((t) => t.date >= startStr && t.date <= endStr);
        const income = weekTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = weekTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        weeks.push({
          id: `week-${w}`,
          label,
          subLabel,
          fullDateLabel,
          income,
          expense,
          net: income - expense,
          txCount: weekTxs.length,
          transactions: weekTxs,
        });
      }
      return weeks;
    }

    // 12 months
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const currentYear = now.getFullYear();

    return thaiMonths.map((mName, idx) => {
      const monthPrefix = `${currentYear}-${String(idx + 1).padStart(2, '0')}`;
      const monthTxs = transactions.filter((t) => t.date.startsWith(monthPrefix));
      const income = monthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      return {
        id: monthPrefix,
        label: mName,
        subLabel: `${currentYear + 543}`,
        fullDateLabel: `เดือน${mName} พ.ศ. ${currentYear + 543}`,
        income,
        expense,
        net: income - expense,
        txCount: monthTxs.length,
        transactions: monthTxs,
      };
    });
  }, [transactions, period]);

  // Overall totals for the selected period
  const totalIncomePeriod = useMemo(() => chartData.reduce((acc, d) => acc + d.income, 0), [chartData]);
  const totalExpensePeriod = useMemo(() => chartData.reduce((acc, d) => acc + d.expense, 0), [chartData]);
  const netSurplusPeriod = totalIncomePeriod - totalExpensePeriod;

  // Maximum value for scaling Y-axis
  const maxPeriodVal = useMemo(() => {
    let m = 0;
    chartData.forEach((d) => {
      if (d.income > m) m = d.income;
      if (d.expense > m) m = d.expense;
    });
    // Set a sensible step and minimum (e.g. 5,000 or rounded up)
    if (m === 0) return 5000;
    const magnitude = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / (magnitude / 2)) * (magnitude / 2);
  }, [chartData]);

  // Y-axis grid markers (4 markers: 100%, 75%, 50%, 25%, 0%)
  const yAxisTicks = useMemo(() => {
    return [
      maxPeriodVal,
      Math.round((maxPeriodVal * 3) / 4),
      Math.round(maxPeriodVal / 2),
      Math.round(maxPeriodVal / 4),
      0,
    ];
  }, [maxPeriodVal]);

  const activePoint = hoveredIndex !== null && chartData[hoveredIndex] ? chartData[hoveredIndex] : null;

  return (
    <div className="bg-surface-container rounded-xl p-5 sm:p-6 shadow-xl border border-outline-variant/30 flex flex-col justify-between relative transition-all">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span>BAR CHART ANALYTICS</span>
          </div>
          <h2 className="text-base sm:text-lg font-headline font-semibold text-on-surface tracking-tight mt-0.5">
            แผนภูมิแท่งกระแสเงินสด (Cash Flow Bar Chart)
          </h2>
          <p className="text-xs text-on-surface-variant">
            เปรียบเทียบรายรับและรายจ่ายจริงตามช่วงเวลาแบบเรียลไทม์
          </p>
        </div>

        {/* Timeframe selector + Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
            <button
              type="button"
              onClick={() => {
                setPeriod('7days');
                setHoveredIndex(null);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                period === '7days'
                  ? 'bg-surface-container-high text-on-surface shadow-sm text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              7 วันล่าสุด
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod('4weeks');
                setHoveredIndex(null);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                period === '4weeks'
                  ? 'bg-surface-container-high text-on-surface shadow-sm text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              4 สัปดาห์
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod('12months');
                setHoveredIndex(null);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                period === '12months'
                  ? 'bg-surface-container-high text-on-surface shadow-sm text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              12 เดือน
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-mono bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant/20">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-tertiary" />
              <span className="text-on-surface">รายรับ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-error" />
              <span className="text-on-surface">รายจ่าย</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Micro-Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 px-3.5 my-3 bg-surface-container-low/70 rounded-xl border border-outline-variant/20 text-xs">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-on-surface-variant">รายรับช่วงนี้:</span>
          <span className="font-mono font-bold text-tertiary text-sm">
            +฿{totalIncomePeriod.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2 border-t sm:border-t-0 sm:border-l border-outline-variant/20 pt-2 sm:pt-0 sm:pl-3">
          <span className="text-on-surface-variant">รายจ่ายช่วงนี้:</span>
          <span className="font-mono font-bold text-error text-sm">
            -฿{totalExpensePeriod.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2 border-t sm:border-t-0 sm:border-l border-outline-variant/20 pt-2 sm:pt-0 sm:pl-3">
          <span className="text-on-surface-variant">ยอดสุทธิ:</span>
          <span
            className={`font-mono font-bold text-sm ${
              netSurplusPeriod >= 0 ? 'text-primary' : 'text-error'
            }`}
          >
            {netSurplusPeriod >= 0 ? '+' : '-'}฿
            {Math.abs(netSurplusPeriod).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Interactive Tooltip Card / Floating Info Bar */}
      <div className="min-h-[38px] flex items-center justify-between bg-surface-container-lowest/80 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs transition-all mb-2">
        {activePoint ? (
          <div className="w-full flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
              <span className="font-semibold text-on-surface font-headline">{activePoint.fullDateLabel}</span>
              {activePoint.txCount > 0 && (
                <span className="bg-surface-container-high px-2 py-0.5 rounded text-[11px] font-mono text-on-surface-variant">
                  {activePoint.txCount} รายการ
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-tertiary">
                รับ: +฿{activePoint.income.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-error">
                จ่าย: -฿{activePoint.expense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`font-bold ${
                  activePoint.net >= 0 ? 'text-primary' : 'text-error'
                }`}
              >
                สุทธิ: {activePoint.net >= 0 ? '+' : '-'}฿
                {Math.abs(activePoint.net).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>เลื่อนเมาส์หรือแตะที่แท่งแผนภูมิเพื่อดูยอดรายรับ-รายจ่ายและรายละเอียดแต่ละวัน</span>
          </div>
        )}
      </div>

      {/* The Bar Chart Canvas Area */}
      <div className="relative w-full h-64 pt-6 pb-2 select-none flex">
        {/* Left Y-Axis Scale Markers */}
        <div className="w-16 h-full flex flex-col justify-between text-right pr-2 text-[10px] font-mono text-on-surface-variant/70 shrink-0 border-r border-outline-variant/20">
          {yAxisTicks.map((val, idx) => (
            <div key={idx} className="h-0 flex items-center justify-end">
              <span>฿{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}</span>
            </div>
          ))}
        </div>

        {/* Chart Bars & Grid Area */}
        <div className="relative flex-1 h-full flex flex-col justify-between pl-2">
          {/* Horizontal Gridlines */}
          <div className="absolute inset-0 pl-2 flex flex-col justify-between pointer-events-none -z-0">
            {yAxisTicks.map((_, idx) => (
              <div
                key={idx}
                className={`w-full border-b ${
                  idx === yAxisTicks.length - 1
                    ? 'border-outline-variant/40'
                    : 'border-outline-variant/15 border-dashed'
                }`}
              />
            ))}
          </div>

          {/* Bars Columns */}
          <div className="relative z-10 w-full h-full flex items-end justify-around gap-1 sm:gap-2">
            {chartData.map((d, index) => {
              const incomeHeight = maxPeriodVal > 0 ? (d.income / maxPeriodVal) * 100 : 0;
              const expenseHeight = maxPeriodVal > 0 ? (d.expense / maxPeriodVal) * 100 : 0;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={d.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex-1 h-full flex flex-col justify-end items-center cursor-pointer rounded-lg transition-all duration-200 px-0.5 sm:px-1 ${
                    isHovered
                      ? 'bg-surface-container-high/60 shadow-sm ring-1 ring-primary/30'
                      : 'hover:bg-surface-container-high/30'
                  }`}
                >
                  {/* Paired Bars Container */}
                  <div className="w-full h-full flex items-end justify-center gap-1 sm:gap-1.5 pb-1">
                    {/* Income Bar (Green) */}
                    <div className="relative flex-1 max-w-[14px] sm:max-w-[20px] h-full flex items-end">
                      <div
                        className={`w-full rounded-t-md bg-gradient-to-t from-tertiary/80 to-tertiary transition-all duration-500 shadow-sm ${
                          isHovered ? 'brightness-125' : ''
                        }`}
                        style={{
                          height: d.income > 0 ? `${Math.max(4, incomeHeight)}%` : '0%',
                        }}
                      />
                    </div>

                    {/* Expense Bar (Red) */}
                    <div className="relative flex-1 max-w-[14px] sm:max-w-[20px] h-full flex items-end">
                      <div
                        className={`w-full rounded-t-md bg-gradient-to-t from-error/80 to-error transition-all duration-500 shadow-sm ${
                          isHovered ? 'brightness-125' : ''
                        }`}
                        style={{
                          height: d.expense > 0 ? `${Math.max(4, expenseHeight)}%` : '0%',
                        }}
                      />
                    </div>
                  </div>

                  {/* Column Base Dot indicator when active or has data */}
                  <div className="h-1 flex items-center justify-center">
                    {d.txCount > 0 ? (
                      <span className="w-1 h-1 rounded-full bg-primary" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-outline-variant/30" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-on-surface-variant pt-2 border-t border-outline-variant/30 pl-16">
        {chartData.map((d, index) => (
          <div
            key={d.id}
            onClick={() => setHoveredIndex(index)}
            className={`flex-1 text-center truncate cursor-pointer transition-colors ${
              hoveredIndex === index ? 'text-primary font-bold' : 'hover:text-on-surface'
            }`}
          >
            <span>{d.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom helper prompt if empty */}
      {totalIncomePeriod === 0 && totalExpensePeriod === 0 && (
        <div className="mt-3 py-2 px-3 bg-surface-container-low rounded-lg border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
            <span>แผนภูมิแท่งพร้อมใช้งานจริง — บันทึกรายการใหม่ผ่านแถบด้านบนเพื่อดูแท่งข้อมูลเติบโตแบบเรียลไทม์</span>
          </div>
          <span className="text-[11px] font-mono text-primary font-medium">เริ่มต้นที่ ฿0.00</span>
        </div>
      )}
    </div>
  );
};
