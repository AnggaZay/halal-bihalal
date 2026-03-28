import React from 'react';

export default function UndanganLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-200 p-4 font-sans">
      {children}
    </main>
  );
}