import { cookies } from 'next/headers';

export async function getRequestAccessToken() {
  const store = await cookies();
  return store.get('access_token')?.value ?? null;
}
