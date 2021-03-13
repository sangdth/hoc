import {
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  GetServerSideProps as SSP,
  GetServerSidePropsContext as SSPC,
} from 'next';
import Peer from 'simple-peer';
import jwt from 'jsonwebtoken';
import {
  Avatar,
  Box,
  Flex,
  Heading,
  Layout,
  Chat,
  Skeleton,
  Stream,
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

const secret = process.env.SECRET || 'secret';

const SingleRoom = () => {
  const [session] = useSession();
  const router = useRouter();
  const { id } = router.query;
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const [otherStreams, setOtherStreams] = useState<any[]>([]);

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

  const { data: roomData, loading } = useSubscription(USERS_IN_ROOM, {
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

  useEffect(() => {
    // TODO: Make types for these guys
    let socket: any;
    const peers: any[] = [];
    const others: any[] = [];

    window.navigator.mediaDevices
      // TODO: Detect only teacher can be true video
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        const { current: video } = myVideoRef;
        if (video) {
          video.srcObject = stream;
          video.play();
        }

        // Don't know why we have to init new instance
        socket = new WebSocket(process.env.NEXT_PUBLIC_HOC_WS || '');

        // if user is not admin of this room, make request
        if (roomData?.room_by_pk.admin.id !== currentUser?.id) {
          socket.onopen = () => {
            socket.send(
              JSON.stringify({
                type: 'signal_request',
                from: currentUser?.id,
                to: roomData?.admin.id,
              }),
            );
          };
        }

        socket.onmessage = ({ data }: { data: any }) => {
          if (!data) return;

          const {
            to,
            type,
            from,
            payload: { code } = { code: '' },
          } = JSON.parse(data);

          if (to !== currentUser?.id) return;

          if (type === 'signal_request') {
            const peer = new Peer({
              initiator: true,
              trickle: false,
              stream,
            });

            peer.on('signal', (signalData: any) => {
              socket.send(
                JSON.stringify({
                  type: 'signal_response',
                  from: currentUser?.id,
                  to: from,
                  payload: {
                    code: jwt.sign(signalData, secret),
                  },
                }),
              );
            });

            peer.on('stream', (otherStream: any) => {
              others.push({
                id: from,
                stream: otherStream,
              });
              setOtherStreams(others.map((o) => o.stream));
            });

            peers.forEach((p: any) => {
              socket.send(
                JSON.stringify({
                  type: 'request_signal',
                  from: currentUser?.id,
                  to: p.id,
                  payload: {
                    code: from,
                  },
                }),
              );
            });

            peers.push({
              id: from,
              initiator: true, // TODO: detect only teacher
              peer,
            });
          }

          if (type === 'sync_request') {
            const registeredPeer = peers.find((peer) => peer.id === from);
            if (registeredPeer) {
              registeredPeer.peer.signal(jwt.verify(code, secret));
            }
          }
          if (type === 'leave_request') {
            const streamIndex = others.findIndex((other) => other.id === from);
            const registeredPeer = peers.find((peer) => peer.id === from);
            others.splice(streamIndex, 1);
            setOtherStreams(others.map((o) => o.stream));
            peers.splice(peers.indexOf(registeredPeer), 1);
            registeredPeer?.peer.destroy();
          }
        };
      })
      .catch((err: any) => {
        // TODO: Error handling better
        throw err;
      });

    const notifyLeave = () => peers.forEach(({ id: to }) => socket.send(
      JSON.stringify({
        type: 'leave_request',
        from: currentUser.id,
        to,
      }),
    ));

    window.onbeforeunload = notifyLeave;

    return () => notifyLeave();
  }, [currentUser, roomData]);

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
              {roomData?.room_by_pk.name || 'unnamed room'}
            </Heading>
          </Skeleton>
          <Box backgroundColor="#EFEFEF" height="100%" marginY="2">
            <video ref={myVideoRef} muted style={{ width: '100%' }} />

            {otherStreams.map((stream) => (
              <Stream key={stream.id} stream={stream} />
            ))}
          </Box>
          <Skeleton w="60%" isLoaded={!loading}>
            <Wrap height="200px">
              {roomData?.room_by_pk.users.map(({ user }: any) => (
                <WrapItem key={user.id}>
                  <Avatar name={user.name} src={user.image} />
                </WrapItem>
              ))}
            </Wrap>
          </Skeleton>
        </Flex>

        <Skeleton isLoaded={!!session && !!currentUser && !!allMessages}>
          {session && currentUser && allMessages && (
          <Chat
            messages={allMessages.message}
            isTyping={false}
            currentUser={currentUser}
            onSend={(t: string) => sendMessage({
              variables: {
                object: {
                  room_id: id,
                  user_id: currentUser?.id,
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
