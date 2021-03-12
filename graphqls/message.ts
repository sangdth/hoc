import gql from 'graphql-tag';

// For testing only, future should use aggregate to load 100 recent messages only
// then fecth old messages when user scroll back.
export const ALL_MESSAGES = gql`
  subscription ALL_MESSAGES ($room_id: uuid!) {
    message(where: {room_id: {_eq: $room_id}}, order_by: {created_at: asc}) {
      created_at
      id
      text
      updated_at
      user {
        created_at
        email
        id
        image
        last_seen
        name
        updated_at
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SEND_MESSAGE ($object: message_insert_input!) {
    insert_message_one(object: $object) {
      created_at
      id
      text
      room_id
      updated_at
      user_id
    }
  }
`;
