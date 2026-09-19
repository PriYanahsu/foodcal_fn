import React from 'react';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // No min-h-screen here: the app shell (ClientLayout) already fills the screen, and a
    // second full-height box would push content past the phone's top and tab bars.
    <div className="flex flex-col">
      <main className="grow">{children}</main>
    </div>
  );
}
