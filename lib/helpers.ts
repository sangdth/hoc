import { initializeApollo } from './apollo';
import { UPSERT_USER } from '../graphqls/user';
import { UserBase } from './types';

export * from 'next/router';
export * from 'react-use';
export * from '@apollo/client';
export * from 'next-auth/client';

export const syncUser = async (token: string, user: UserBase) => {
  try {
    const { email, image, name } = user;
    const apolloClient = initializeApollo(null, token);
    const response = await apolloClient.mutate({
      mutation: UPSERT_USER,
      variables: {
        objects: { email, image, name },
      },
    });
    if (response?.data?.insert_user?.affected_rows > 1) {
      throw new Error('User duplicated, check the database.');
    }
    return response?.data?.insert_user?.returning[0];
  } catch (error) {
    // console.log('### error: ', error);
    throw new Error('syncUser has problem, check the log');
  }
};

export const getRichProfile = () => {};
