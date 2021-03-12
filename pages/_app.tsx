import { ApolloProvider } from '@apollo/client';
import { Provider as AuthProvider } from 'next-auth/client';
import { ChakraProvider } from '@chakra-ui/react';
// import Head from "next/head";
import { AppProps } from 'next/app';

import { useApollo } from '../lib/apollo';

import '../styles/global.css';

const authOptions = {
  clientMaxAge: 0,
  keepAlive: 0,
};

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps);

  /* <Head> */
  /*   <link rel="shortcut icon" href="/images/favicon.ico" /> */
  /* </Head> */
  return (
    <ChakraProvider portalZIndex={999}>
      <AuthProvider options={authOptions} session={pageProps.session}>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} /* eslint-disable-line */ />
        </ApolloProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}
