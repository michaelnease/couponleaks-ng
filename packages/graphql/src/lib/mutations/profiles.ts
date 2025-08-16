import { gql } from '@apollo/client';

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($username: String!, $input: UpdateProfileInput!) {
    updateProfile(username: $username, input: $input) {
      username
      displayName
      bio
      website
      avatarUrl
      isFeaturedKey
      updatedAt
    }
  }
`;
