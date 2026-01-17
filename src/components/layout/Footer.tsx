'use client';
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[var(--card-bg)] border-t border-[var(--card-border)] mt-auto backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-[var(--text-muted)]">
          <p>&copy; {new Date().getFullYear()} FoodCal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
