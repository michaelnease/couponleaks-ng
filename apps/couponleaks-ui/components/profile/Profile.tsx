'use client';

import { useQuery } from '@apollo/client';
import { GET_PROFILE_BY_USERNAME } from '@couponleaks-ng/graphql';

export function Profile({ username }: { username: string }) {
  const isLoggedIn = false; // replace with your real auth state

  const { data, loading, error } = useQuery(GET_PROFILE_BY_USERNAME, {
    variables: { username, isLoggedIn },
    errorPolicy: 'all', // tolerate field level auth errors if any
    skip: !username,
  });

  if (loading) return <p>Loading...</p>;
  if (error && !data) return <p>Error loading profile</p>;

  const p = data?.getProfile;
  return (
    <div>
      <h1>{p?.displayName}</h1>
      <p>{p?.bio}</p>
      <a href={p?.website}>{p?.website}</a>
      {isLoggedIn && p?.secret && <p>Secret: {p.secret}</p>}
    </div>
  );
}
