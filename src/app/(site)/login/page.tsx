import { AuthPage, parseAuthView } from '@/features/auth';
import { SESSION_EXPIRED_PARAM } from '@/lib/springboot/auth-tokens';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[]; [SESSION_EXPIRED_PARAM]?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthPage
      initialView={parseAuthView(params.view)}
      sessionExpired={Boolean(params[SESSION_EXPIRED_PARAM])}
    />
  );
}
