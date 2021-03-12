import { useEffect } from 'react';
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
import { ALL_ROOMS, JOIN_ROOM } from 'graphqls/room';

const RoomIndex = () => {
  // make the errorBoundary for this view
  const { data, loading: queryLoading } = useQuery(ALL_ROOMS, {
    fetchPolicy: 'cache-and-network',
  });

  const [session] = useSession();
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
                    <NextLink href="/rooms/[id]" as={`/rooms/${o.id}`} passHref>
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
