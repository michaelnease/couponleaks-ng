import { gql } from '@apollo/client';

export const GET_PROFILE_BY_USERNAME = gql`
  query GetProfileByUsername($username: String!) {
    getProfile(username: $username) {
      username
      displayName
      bio
      website
      secret
    }
  }
`;
