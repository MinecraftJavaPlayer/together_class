import './globals.css';
import React from 'react';
import { ThemeWatcher } from './components/ThemeWatcher';

export const metadata = {
  title: '다함께교실 (Dahamkke Classroom)',
  description: '이주배경학생의 학습장벽(언어)을 허무는 다국어 교육 플랫폼',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('dahamkke_dark_mode') === 'true') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }

            // Determine Season based on calendar date or manual preview override
            // 봄: 3/1 ~ 5/31 | 여름: 6/1 ~ 8/31 | 가을: 9/1 ~ 11/30 | 겨울: 12/1 ~ 2/28(2/29)
            var overrideSeason = localStorage.getItem('dahamkke_season_override');
            var season = overrideSeason;
            if (!season || ['spring', 'summer', 'autumn', 'winter'].indexOf(season) === -1) {
              var now = new Date();
              var m = now.getMonth() + 1;
              if (m >= 3 && m <= 5) {
                season = 'spring';
              } else if (m >= 6 && m <= 8) {
                season = 'summer';
              } else if (m >= 9 && m <= 11) {
                season = 'autumn';
              } else {
                season = 'winter';
              }
            }
            document.documentElement.setAttribute('data-season', season);
            document.documentElement.style.setProperty('--season-bg-desktop', "url('/backgrounds/desktop_" + season + ".jpg')");
            document.documentElement.style.setProperty('--season-bg-mobile', "url('/backgrounds/mobile_" + season + ".jpg')");
          } catch (e) {}
        ` }} />
      </head>
      <body>
        <div id="seasonal-bg-fixed" aria-hidden="true" />
        <ThemeWatcher />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
