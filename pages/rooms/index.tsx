import { useEffect, useMemo } from 'react';
import NextLink from 'next/link';
import {
  GetServerSideProps as SSP,
  GetServerSidePropsContext as SSPC,
} from 'next';
import {
  Avatar,
  AvatarGroup,
  Box,
  Center,
  Layout,
  Wrap,
  WrapItem,
  LinkBox,
  LinkOverlay,
  Skeleton,
  SkeletonCircle,
} from 'components';
import {
  getSession,
  useMutation,
  useQuery,
  useRouter,
  useSession,
} from 'lib/helpers';
import { GET_SINGLE_USER } from 'graphqls/user';
import { ALL_ROOMS, JOIN_ROOM } from 'graphqls/room';

const RoomIndex = () => {
  // make the errorBoundary for this view
  const { data, loading: queryLoading } = useQuery(ALL_ROOMS, {
    fetchPolicy: 'cache-and-network',
  });

  const [session] = useSession();
  console.log('### session: ', session);
  const [joinRoom, { loading: mutateLoading }] = useMutation(JOIN_ROOM);

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url.includes('rooms') && url.split('-').length === 5) {
        joinRoom({
          variables: {
            object: {
              room_id: url.split('/')[2],
              user_id: session?.user_id,
            },
          },
        });
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [session, joinRoom, router]);

  const { data: userQuery } = useQuery(GET_SINGLE_USER, {
    variables: { email: session?.user.email },
    fetchPolicy: 'cache-and-network',
  });

  const currentUser = useMemo(() => {
    const profile = userQuery?.user_aggregate.nodes[0];
    if (profile) {
      return profile;
    }
    return null;
  }, [userQuery]);

  const hrefLink = (room: any) => {
    const isAdmin = room.admin.id === currentUser?.id;
    return isAdmin ? '/rooms/[id]' : '/rooms/[id]/join/[code]';
  };

  const asLink = (room: any) => {
    const isAdmin = room.admin.id === currentUser?.id;
    return isAdmin ? `/rooms/${room.id}` : `/rooms/${room.id}/join/${currentUser?.id}`;
  };

  return (
    <Layout>
      <Wrap>
        {data?.room?.map((o: any) => (
          <WrapItem key={o.id}>
            <LinkBox as="div">
              <Skeleton isLoaded={!queryLoading}>
                <Box
                  w="320px"
                  h="200px"
                  paddingX="2"
                  bg="blue.400"
                  borderRadius="md"
                  color="white"
                  fontSize="18px"
                  fontWeight="600"
                >
                  <Center h="80%" w="100%">
                    <NextLink href={hrefLink(o)} as={asLink(o)} passHref>
                      <LinkOverlay>
                        {o.name}
                      </LinkOverlay>
                    </NextLink>
                  </Center>
                  <SkeletonCircle isLoaded={!mutateLoading}>
                    <AvatarGroup size="sm" max={9}>
                      {o.users.map(({ user }: any) => (
                        <Avatar
                          key={user.id}
                          name={user.name}
                          src={user.image}
                        />
                      ))}
                    </AvatarGroup>
                  </SkeletonCircle>
                </Box>
              </Skeleton>
            </LinkBox>
          </WrapItem>
        ))}
      </Wrap>
    </Layout>
  );
};

export default RoomIndex;

export const getServerSideProps: SSP = async (context: SSPC) => {
  const session = await getSession(context);
  return {
    props: { session },
  };
};
