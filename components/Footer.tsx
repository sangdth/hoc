import Link from 'next/link';
import { Box, Divider, Flex } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box
      h="60px"
      paddingY="4"
      fontSize="10px"
      color="#999999"
    >
      <Divider />
      <Flex paddingY="2">
        <Box>
          <Link href="/"><a>© 2021 Chi Bằng Học</a></Link>
        </Box>
        <Box paddingX="10">
          <Link href="/privacy"><a>Privacy</a></Link>
        </Box>
        <Box>
          <Link href="/terms"><a>Terms</a></Link>
        </Box>
      </Flex>
    </Box>
  );
}
