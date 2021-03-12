import * as React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useSession } from 'next-auth/client';

import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [session] = useSession();

  return (
    <Flex
      direction="column"
      height="100%"
      padding="4"
      margin="0 auto"
    >
      <Header />
      <Box flex="1" paddingX="2">
        {session ? children : (<div>unauthorised</div>)}
      </Box>
      <Footer />
    </Flex>
  );
}
