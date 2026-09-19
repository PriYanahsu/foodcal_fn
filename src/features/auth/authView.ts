/** Which screen /login shows. Kept outside the client component so the server page can call it. */
export type AuthView = 'landing' | 'login' | 'signup' | 'created';

/** Views that get their own URL (`/login?view=…`). "created" is transient and never linked to. */
export type LinkableAuthView = Exclude<AuthView, 'created'>;

export const AUTH_VIEW_PARAM = 'view';

export function parseAuthView(value: string | string[] | null | undefined): LinkableAuthView {
  const view = Array.isArray(value) ? value[0] : value;
  return view === 'login' || view === 'signup' ? view : 'landing';
}
