import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-[var(--card-bg)] border-t border-[var(--card-border)] backdrop-blur-xl relative z-20">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 rotate-3 group-hover:rotate-6 transition-transform">
                <SparklesIcon className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">
                Food<span className="text-[var(--primary)]">Cal</span>
              </span>
            </Link>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-sm">
              The future of AI-powered nutrition. Real-time calorie tracking and professional health
              coaching in the palm of your hand.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href={ROUTES.SCAN}
                  className="text-[var(--text-muted)] hover:text-[var(--primary)] text-sm font-medium transition-colors"
                >
                  Digital Scan
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.HISTORY}
                  className="text-[var(--text-muted)] hover:text-[var(--primary)] text-sm font-medium transition-colors"
                >
                  Meal History
                </Link>
              </li>
              <li>
                <Link
                  href="/fitness"
                  className="text-[var(--text-muted)] hover:text-[var(--primary)] text-sm font-medium transition-colors"
                >
                  Fitness Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-[var(--text-muted)] hover:text-[var(--primary)] text-sm font-medium transition-colors"
                >
                  Profile Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/privacy"
                  className="text-[var(--text-muted)] hover:text-[var(--primary)] text-sm font-medium transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[var(--text-muted)] hover:text-[var(--primary)] text-sm font-medium transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} KRIXEN-ORG. Powered by Gemini AI.
          </p>
          <div className="flex gap-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
              System Operational
            </span>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--primary)]/5 blur-[100px] pointer-events-none -z-10" />
    </footer>
  );
}
