import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FoodCal - AI Nutrition Tracker',
  description: 'Track your nutrition instantly with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] min-h-screen flex`}>
        {/* Sidebar is fixed, so we add margin on desktop */}
        <Sidebar />

        <main className="flex-1 md:ml-64 transition-all duration-300 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
