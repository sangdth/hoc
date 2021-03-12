import gql from 'graphql-tag';

export const ALL_USERS = gql`
  query ALL_USERS {
    user {
      email
      id
      image
      name
    }
  }
`;

export const GET_SINGLE_USER = gql`
  query GET_SINGLE_USER ($email: String!) {
    user_aggregate(where: {email: {_eq: $email}}) {
      nodes {
        created_at
        email
        id
        image
        last_seen
        last_typed
        name
        updated_at
      }
    }
  }
`;

export const GET_USERS = gql`
  query GET_USERS ($ids: [uuid!]) {
    user (where: { id: { _in: $ids } }) {
      email
      id
      image
      name
    }
  }
`;

export const USER_ONLINE = gql`
  subscription USER_ONLINE {
    user_online {
      email
      id
      name
    }
  }
`;

export const UPSERT_USER = gql`
  mutation UPSERT_USER ($objects: [user_insert_input!]!) {
    insert_user(
      objects: $objects,
      on_conflict: {
        constraint: user_email_key,
        update_columns: [updated_at, name, image]
      }
    ) {
      affected_rows
      returning {
        id
        name
        email
        image
        created_at
      }
    }
  }
`;
