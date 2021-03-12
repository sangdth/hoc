import { useMemo } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  HttpLink,
  split,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
// import { SubscriptionClient } from "subscriptions-transport-ws";
import fetch from 'isomorphic-unfetch';
// import ws from "isomorphic-ws";

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

const isServer = typeof window === 'undefined';

const makeHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'x-hasura-role': 'admin', // can not miss this mother fucker
});

const createHttpLink = (token: string = '') => new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8000/v1/graphql',
  credentials: 'same-origin',
  headers: makeHeaders(token),
  fetch,
});

const createWSLink = (token: string) => new WebSocketLink({
  uri: process.env.NEXT_PUBLIC_WS_URL || 'wss://localhost:8000/v1/graphql',
  options: {
    lazy: true,
    reconnect: true,
    connectionParams: {
      authToken: token,
      headers: makeHeaders(token),
    },
  },
});

let apolloClient: ApolloClient<NormalizedCacheObject>;

export function createApolloClient(token: string) {
  const cacheOptions = {
    typePolicies: {
      Subscription: {
        fields: {
          user_online: {
            merge(_: any, incoming: any) {
              return incoming;
            },
          },
        },
      },
    },
  };

  const splitLink = !isServer
    ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition'
          && definition.operation === 'subscription'
        );
      },
      createWSLink(token),
      createHttpLink(token),
    )
    : createHttpLink(token);

  return new ApolloClient({
    cache: new InMemoryCache(cacheOptions),
    link: splitLink,
    ssrMode: isServer,
  });
}

export function initializeApollo(initialState: any, token: string) {
  const client = apolloClient ?? createApolloClient(token);

  if (initialState) {
    const existingCache = client.extract();
    client.cache.restore({ ...existingCache, ...initialState });
  }

  // For SSG and SSR always create a new Apollo Client
  if (isServer) return client;

  // Create the Apollo Client once in the client
  if (!apolloClient) {
    apolloClient = client;
  }

  return client;
}

export function addApolloState(client: any, pageProps: any) {
  let tmpPageProps = { ...pageProps };
  if (tmpPageProps?.props) {
    tmpPageProps = {
      ...tmpPageProps,
      props: {
        ...tmpPageProps.props,
        [APOLLO_STATE_PROP_NAME]: client?.cache.extract(),
      },
    };
  }

  return tmpPageProps;
}

export function useApollo(pageProps: any) {
  const token = pageProps?.session?.token;
  const state = pageProps?.props?.APOLLO_STATE_PROP_NAME;
  const store = useMemo(() => initializeApollo(state, token), [state, token]);
  return store;
}
