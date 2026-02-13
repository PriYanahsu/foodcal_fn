import HeroSection from '@/components/home/HeroSection';
import Footer from '@/components/layout/Footer';
import React from 'react';

export default function HeroPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <HeroSection />
      <Footer />
    </main>
  );
}
