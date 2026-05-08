import React from 'react';
import { toNumber } from '../utils';

export default function ReportTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload?.length) return null;

  const shouldFormatCurrency = (entryName) => ['Revenue', 'revenue', 'AOV'].includes(entryName);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
      <p className="font-black text-slate-800 text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="text-xs font-bold" style={{ color: entry.color }}>
          {entry.name}: {shouldFormatCurrency(entry.name) ? formatCurrency(toNumber(entry.value)) : toNumber(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}
