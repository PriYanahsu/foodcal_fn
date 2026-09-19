import { Bricolage_Grotesque, Figtree } from 'next/font/google';

/** Display face for headings and numbers — use the `font-display` utility. */
export const displayFont = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

/** UI/body face — use the `font-ui` utility. */
export const uiFont = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});
