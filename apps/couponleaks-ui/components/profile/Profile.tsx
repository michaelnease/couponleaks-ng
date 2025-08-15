'use client';

import { GET_PROFILE_BY_USERNAME } from '@couponleaks-ng/graphql';
import { useQuery } from '@apollo/client';

export function Profile({ username }: { username: string }) {
  const { data, loading, error } = useQuery(GET_PROFILE_BY_USERNAME, {
    variables: { username },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile</p>;

  console.log({ data });

  return (
    <div>
      <h1>{data.getProfile.displayName}</h1>
      <p>{data.getProfile.bio}</p>
      <a href={data.getProfile.website}>{data.getProfile.website}</a>
    </div>
  );
}
