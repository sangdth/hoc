import gql from 'graphql-tag';

export const ALL_ROOMS = gql`
  query ALL_ROOMS {
    room {
      id
      name
      admin {
        id
        name
        email
      }
      users {
        user {
          id
          image
          email
          name
        }
      }
    }
  }
`;

export const SINGLE_ROOM = gql`
  query SINGLE_ROOM ($id: uuid!) {
    room_by_pk (id: $id) {
      id
      name
      users {
         user {
          id
          image
          email
          name
        }
      }
    }
  }
`;

// Watching the users join the room
export const USERS_IN_ROOM = gql`
  subscription USERS_IN_ROOM ($id: uuid!) {
    room_by_pk(id: $id) {
      id
      name
      admin {
        id
        name
        email
      }
      users {
        user_id
        user {
          id
          image
          email
          name
        }
      }
    }
  }
`;

export const JOIN_ROOM = gql`
  mutation USER_JOIN_ROOM ($object: room_user_insert_input!) {
    insert_room_user_one (
      object: $object,
      on_conflict: { constraint: room_user_pkey, update_columns: updated_at }
    ) {
      created_at
      room_id
      updated_at
      user_id
    }
  }
`;

export const LEAVE_ROOM = gql`
  mutation USER_LEAVE_ROOM ($user_id: uuid!, $room_id: uuid!) {
    delete_room_user_by_pk (user_id: $user_id, room_id: $room_id) {
      user_id
    }
  }
`;
