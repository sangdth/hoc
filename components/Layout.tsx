import * as React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useSession } from 'next-auth/client';

import Header from './Header';
import Footer from './Footer';

type Props = {
  children: React.ReactNode;
  protect?: boolean;
};

export default function Layout(props: Props) {
  const { children, protect = true } = props;
  const [session] = useSession();

  return (
    <Flex
      direction="column"
      height="100%"
      width={[
        '90%', // 0-30em
        '85%', // 30em-48em
        '75%',
        '65%',
      ]}
      margin="0 auto"
    >
      <Header />
      <Box flex="1" h="calc(100vh - 120px)">
        {(!protect || session) ? children : <div>Unauthorised</div>}
      </Box>
      <Footer />
    </Flex>
  );
}
