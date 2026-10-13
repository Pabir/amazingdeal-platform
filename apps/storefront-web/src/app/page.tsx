import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles host resolution and rewrites to /sites/[tenantSlug]
  // Fallback direct root accesses redirect to default demo store
  redirect('/?store=footwear');
}
