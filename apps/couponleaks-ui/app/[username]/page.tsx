import { notFound } from 'next/navigation';
import { Profile } from '@/components/profile';

type RouteParams = { username: string };

export default async function Page({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { username } = await params;
  if (!username || typeof username !== 'string') notFound();

  let safeUsername: string;
  try {
    safeUsername = decodeURIComponent(username).trim();
  } catch {
    notFound();
  }
  if (!safeUsername) notFound();

  return <Profile username={safeUsername} />;
}
