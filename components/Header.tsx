import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/client';
import {
  Box,
  Button,
  Flex,
  Heading,
  Spacer,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

// The approach used in this component shows how to built a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const [session] = useSession();

  return (
    <Flex h="60px" paddingY="2" alignItems="center">
      <Box>
        <Heading size="md">
          <Link href="/"><a>Chi Bằng Học</a></Link>
        </Heading>
      </Box>
      <Box paddingX="8">
        <Link href="/rooms"><a>Rooms</a></Link>
      </Box>
      <Spacer />
      <Box>
        {!session ? (
          <Button
            as="a"
            colorScheme="green"
            href="/api/auth/signin"
            onClick={(e) => {
              e.preventDefault();
              signIn();
            }}
          >
            Log in
          </Button>
        ) : (
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              {session.user.name || session.user.email}
            </MenuButton>
            <MenuList>
              <MenuItem
                as="a"
                href="/api/auth/signout"
                onClick={(e) => {
                  e.preventDefault();
                  signOut();
                }}
              >
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Box>
    </Flex>
  );
}
