/**
 * Get VAPID public key for push notifications
 * This ensures the key is accessible on both client and server
 */
export function getVapidPublicKey(): string | null {
  if (typeof window !== 'undefined') {
    // Client-side: try multiple ways to get the key
    return (
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      (window as any).NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      null
    );
  }
  // Server-side
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
}
