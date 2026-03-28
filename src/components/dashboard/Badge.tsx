import React from 'react';

interface BadgeProps {
  status: 'success' | 'warning' | 'error' | 'default';
  children: React.ReactNode;
}

export default function Badge({ status, children }: BadgeProps) {
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-[#A6824A]/10 text-[#A6824A] border-[#A6824A]/30', // Emas/Pending
    error: 'bg-[#5D1E21]/10 text-[#5D1E21] border-[#5D1E21]/20', // Marun/Batal
    default: 'bg-gray-100 text-[#6B7280] border-gray-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {children}
    </span>
  );
}