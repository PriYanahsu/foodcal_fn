import React from 'react';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow">{children}</main>
    </div>
  );
}
