import { AuthPage, parseAuthView } from '@/features/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const { view } = await searchParams;
  return <AuthPage initialView={parseAuthView(view)} />;
}
