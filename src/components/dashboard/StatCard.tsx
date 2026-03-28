import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

export default function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="bg-[#FFFFFF] p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
      <div className="p-3 bg-[#A6824A]/10 text-[#A6824A] rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-[#6B7280] mb-1">{title}</h3>
        <p className="text-2xl font-bold text-[#101111]">{value}</p>
        {description && (
          <p className="text-xs text-[#6B7280] mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}