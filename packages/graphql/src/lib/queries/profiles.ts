import { gql } from '@apollo/client';

export const GET_PROFILE_BY_USERNAME = gql`
  query GetProfile($username: String!, $isLoggedIn: Boolean = false) {
    getProfile(username: $username) {
      username
      displayName
      bio
      website
      secret @include(if: $isLoggedIn)
    }
  }
`;
