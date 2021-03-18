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
import { v4 as uuidv4 } from 'uuid';
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
import { WATCH_ROOM, LEAVE_ROOM, UPDATE_ROOM } from 'graphqls/room';
import { GET_SINGLE_USER } from 'graphqls/user';
import { ALL_MESSAGES, SEND_MESSAGE } from 'graphqls/message';

const secret = process.env.SECRET || 'secret';

// This is the single room for host (teacher) only
// Students should be redirected to /rooms/<id>/join
const SingleRoom = () => {
  const [session] = useSession();
  const router = useRouter();
  const { id: roomId } = router.query;
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const [otherStreams, setOtherStreams] = useState<any[]>([]);

  const [callId] = useState(uuidv4());

  const [updateRoom] = useMutation(UPDATE_ROOM);

  useEffect(() => {
    const handleUpdateRoom = async () => {
      await updateRoom({
        variables: {
          pk_columns: { id: roomId },
          _set: { call_id: callId },
        },
      });
    };

    handleUpdateRoom();
  }, [callId, roomId, updateRoom]);

  const { data: allMessages } = useSubscription(ALL_MESSAGES, {
    variables: { room_id: roomId }, // id is room's UUID
  });

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

  const { data: roomData, loading } = useSubscription(WATCH_ROOM, {
    variables: { id: roomId }, // id is room's UUID
  });

  const [leaveRoom] = useMutation(LEAVE_ROOM);

  useEffect(() => {
    const handleRouteChange = async (url: string) => {
      if (url.split('-').length !== 5) {
        await updateRoom({
          variables: {
            pk_columns: { id: roomId },
            _set: { call_id: null },
          },
        });
        await leaveRoom({
          variables: {
            room_id: roomId,
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
  }, [
    leaveRoom,
    roomId,
    router,
    session,
    updateRoom,
  ]);

  const [sendMessage] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_HOC_WS || '');
    const peers: any[] = [];
    const others: any[] = [];

    window.navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        const { current: video } = myVideoRef;

        if (video) {
          video.srcObject = stream;
          video.play();
        }

        socket.onmessage = ({ data }: { data: any }) => {
          const {
            to, type, from, payload: { code } = { code: '' },
          } = JSON.parse(data);

          if (to !== callId) return;

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
                  from: callId,
                  to: from,
                  payload: {
                    code: jwt.sign(signalData, secret),
                  },
                }),
              );
            });
            peer.on('stream', (otherStream: any) => {
              const tmp = [...others];
              const foundIndex = tmp.findIndex((o) => o.id === from);

              if (foundIndex === -1) { // not found
                tmp.push({
                  id: from,
                  stream: otherStream,
                });
              } else {
                tmp.splice(foundIndex, 1, {
                  id: from,
                  stream: otherStream,
                });
              }

              setOtherStreams(tmp.map((o) => o.stream));
            });

            const foundIndex = peers.findIndex((p: any) => p.id === from);

            if (foundIndex === -1) {
              peers.push({
                id: from,
                initiator: true,
                peer,
              });
            } else {
              peers.splice(foundIndex, 1, {
                id: from,
                initiator: true,
                peer,
              });
            }

            peers.forEach((otherPeer: any) => {
              socket.send(
                JSON.stringify({
                  type: 'request_signal',
                  from: callId,
                  to: otherPeer.id,
                  payload: {
                    code: from,
                  },
                }),
              );
            });
          }

          if (type === 'sync_request') {
            const registeredPeer = peers.find((peer) => peer.id === from);
            if (registeredPeer && registeredPeer.peer) {
              registeredPeer.peer.signal(jwt.verify(code, secret));
            }
          }

          if (type === 'leave_request') {
            const streamIndex = others.findIndex((other) => other.id === from);

            if (streamIndex !== -1) {
              others.splice(streamIndex, 1);
            }

            const registeredPeer = peers.find((peer) => peer.id === from);

            if (registeredPeer) {
              peers.splice(peers.indexOf(registeredPeer), 1);
              registeredPeer?.peer?.destroy();
            }

            setOtherStreams(others.map((o) => o.stream));
          }
        };
      })
      .catch((err) => console.error(err));

    const notifyLeave = () => peers.forEach(({ id: to }) => socket.send(
      JSON.stringify({
        type: 'leave_request',
        from: callId,
        to,
      }),
    ));
    window.onbeforeunload = notifyLeave;
    return () => notifyLeave();
  }, []);

  return (
    <Layout>
      <Box height="100%" width="100%" display="flex">
        <Flex
          direction="column"
          justifyContent="space-between"
          width="100%"
        >
          <Box backgroundColor="#EFEFEF" height="100%" marginY="2">
            <video ref={myVideoRef} muted style={{ width: '100%' }} />

            <Skeleton w="30%" isLoaded={!loading}>
              <Heading as="h4" size="md">
                Teacher: {roomData?.room_by_pk.name || 'unnamed room'}
              </Heading>
            </Skeleton>

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
                  room_id: roomId,
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
