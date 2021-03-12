import { useEffect, useMemo } from 'react';
import {
  GetServerSideProps as SSP,
  GetServerSidePropsContext as SSPC,
} from 'next';
import {
  Avatar,
  Box,
  Flex,
  Heading,
  Layout,
  ChatWidget,
  Skeleton,
  Wrap,
  WrapItem,
} from 'components';
import {
  getSession,
  useMutation,
  useRouter,
  useQuery,
  useSession,
  useSubscription,
} from 'lib/helpers';
// import { UserProfile } from 'lib/types';
import { USERS_IN_ROOM, LEAVE_ROOM } from 'graphqls/room';
import { GET_SINGLE_USER } from 'graphqls/user';
import { ALL_MESSAGES, SEND_MESSAGE } from 'graphqls/message';

const SingleRoom = () => {
  const [session] = useSession();
  const router = useRouter();
  const { id } = router.query;

  const { data: allMessages } = useSubscription(ALL_MESSAGES, {
    variables: { room_id: id }, // id is room's UUID
  });

  // console.log('### allMessages: ', allMessages);
  //
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

  // console.log('### currentUser: ', currentUser);

  const { data, loading } = useSubscription(USERS_IN_ROOM, {
    variables: { id }, // id is room's UUID
  });

  const [leaveRoom] = useMutation(LEAVE_ROOM);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url.split('-').length !== 5) {
        leaveRoom({
          variables: {
            room_id: id,
            user_id: session?.user_id,
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
  }, [id, session, leaveRoom, router]);

  const [sendMessage] = useMutation(SEND_MESSAGE);

  return (
    <Layout>
      <Box height="100%" width="100%" display="flex">
        <Flex
          direction="column"
          justifyContent="space-between"
          width="100%"
        >
          <Skeleton w="30%" isLoaded={!loading}>
            <Heading as="h4" size="md">
              {data?.room_by_pk.name || 'unnamed room'}
            </Heading>
          </Skeleton>
          <Box backgroundColor="#EFEFEF" height="100%" marginY="2">
            &nbsp;
          </Box>
          <Skeleton w="60%" isLoaded={!loading}>
            <Wrap height="200px">
              {data?.room_by_pk.users.map(({ user }: any) => (
                <WrapItem key={user.id}>
                  <Avatar name={user.name} src={user.image} />
                </WrapItem>
              ))}
            </Wrap>
          </Skeleton>
        </Flex>

        <Skeleton isLoaded={!!session && !!currentUser}>
          {session && currentUser && allMessages && (
          <ChatWidget
            messages={allMessages.message}
            isTyping={false}
            currentUser={currentUser}
            onSend={(t: string) => sendMessage({
              variables: {
                object: {
                  room_id: id,
                  user_id: currentUser.id,
                  text: t,
                },
              },
            })}
          />
          )}
        </Skeleton>
      </Box>
    </Layout>
  );
};

export default SingleRoom;

export const getServerSideProps: SSP = async (context: SSPC) => {
  const session = await getSession(context);
  return {
    props: { session },
  };
};
