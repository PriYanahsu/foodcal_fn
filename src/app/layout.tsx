import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';
import { BRAND_ASSETS } from '@/lib/brand-config';

export const metadata: Metadata = {
  title: 'FoodCal - AI Nutrition Tracker',
  description: 'Track your nutrition instantly with AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href={BRAND_ASSETS.favicon} />
        <link rel="apple-touch-icon" href={BRAND_ASSETS.appleTouchIcon} />
        <meta name="theme-color" content="#000000" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('foodcal-theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#000000':'#f2f2f2');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      // Update service worker if available
                      registration.update();
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                  
                  // Also try to register immediately (for faster mobile support)
                  if (navigator.serviceWorker.controller) {
                    console.log('ServiceWorker already active');
                  }
                });
                
                // Re-register on focus (helps with mobile browsers)
                window.addEventListener('focus', function() {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistration().then(function(registration) {
                      if (registration) {
                        registration.update();
                      } else {
                        navigator.serviceWorker.register('/sw.js', { scope: '/' });
                      }
                    });
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
