import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low py-8 mt-16 border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="font-headline font-semibold text-on-surface">Obsidian Ledger</span>
          <span>— Precision Financial System</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <span>สกุลเงิน: THB (฿)</span>
          <span className="inline-flex items-center gap-1 text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            ข้อมูลถูกบันทึกในเครื่อง
          </span>
          <span>© 2025 Obsidian Ledger</span>
        </div>
      </div>
    </footer>
  );
};
