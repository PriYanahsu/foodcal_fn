import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';
import { BRAND_ASSETS } from '@/lib/brand-config';
import { displayFont, uiFont } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'FoodCal - AI Nutrition Tracker',
  description: 'Track your nutrition instantly with AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${displayFont.variable} ${uiFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href={BRAND_ASSETS.favicon} />
        <link rel="apple-touch-icon" href={BRAND_ASSETS.appleTouchIcon} />
        <meta name="theme-color" content="#000000" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('foodcal-theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#000000':'#eef3e9');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
                if (local) {
                  navigator.serviceWorker.getRegistrations().then(function(rs) {
                    rs.forEach(function(r) { r.unregister(); });
                  });
                  if (window.caches) {
                    caches.keys().then(function(keys) {
                      keys.forEach(function(k) { caches.delete(k); });
                    });
                  }
                  return;
                }
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      registration.update();
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
