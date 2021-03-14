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
import { USERS_IN_ROOM, LEAVE_ROOM } from 'graphqls/room';
import { GET_SINGLE_USER } from 'graphqls/user';
import { ALL_MESSAGES, SEND_MESSAGE } from 'graphqls/message';

const secret = process.env.SECRET || 'secret';

// This is the single room for students
const RoomStudent = () => {
  const [session] = useSession();
  const router = useRouter();
  const { id: roomId, code: clientCode } = router.query;
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const [otherStreams, setOtherStreams] = useState<any[]>([]);
  console.log('### otherStreams on client: ', otherStreams);

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

  const { data: roomData, loading } = useSubscription(USERS_IN_ROOM, {
    variables: { id: roomId }, // id is room's UUID
  });

  const [leaveRoom] = useMutation(LEAVE_ROOM);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url.split('-').length !== 5) {
        leaveRoom({
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
  }, [roomId, session, leaveRoom, router]);

  const [sendMessage] = useMutation(SEND_MESSAGE);

  const id = clientCode;

  useEffect(() => {
    let socket;
    const peers = [];
    const others = [];

    window.navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        const { current: video } = myVideoRef;
        socket = new WebSocket('wss://chibanghoc-ws.glitch.me');

        video.srcObject = stream;
        video.play();

        socket.onopen = () => {
          console.log('### socket onopen on client');
          socket.send(
            JSON.stringify({
              type: 'signal_request',
              from: id,
              to: roomId,
            }),
          );
        };

        socket.onmessage = ({ data }) => {
          console.log('### socket on message client data: ', data);
          const {
            to, type, from, payload: { code } = { code: '' },
          } = JSON.parse(data);

          if (to !== id) return;

          if (type === 'signal_response') {
            const peer = new Peer({
              initiator: false,
              trickle: false,
              stream,
            });

            peer.on('signal', (data) => {
              socket.send(
                JSON.stringify({
                  type: 'sync_request',
                  from: id,
                  to: from,
                  payload: {
                    code: jwt.sign(data, secret),
                  },
                }),
              );
            });
            peer.on('stream', (stream) => {
              const tmp = [...others];
              const foundIndex = tmp.findIndex((o) => o.id === stream.id);

              if (foundIndex === -1) { // not found
                tmp.push({
                  id: from,
                  stream,
                });
              } else {
                tmp.splice(foundIndex, foundIndex + 1, stream);
              }

              setOtherStreams(tmp.map((o) => o.stream));
            });

            peer.signal(jwt.verify(code, secret));

            const foundIndex = peers.findIndex((p: any) => p.id === from);

            if (foundIndex === -1) {
              peers.push({
                id: from,
                initiator: false,
                peer,
              });
            } else {
              peers.splice(foundIndex, foundIndex + 1, {
                id: from,
                initiator: false,
                peer,
              });
            }
          }

          if (type === 'request_signal') {
            socket.send(
              JSON.stringify({
                type: 'signal_request',
                from: id,
                to: code,
              }),
            );
          }

          if (type === 'signal_request') {
            const peer = new Peer({
              initiator: true,
              trickle: false,
              stream,
            });
            peer.on('signal', (data) => {
              socket.send(
                JSON.stringify({
                  type: 'signal_response',
                  from: id,
                  to: from,
                  payload: {
                    code: jwt.sign(data, secret),
                  },
                }),
              );
            });
            peer.on('stream', (stream) => {
              const tmp = [...others];
              const foundIndex = tmp.findIndex((o) => o.id === stream.id);

              if (foundIndex === -1) { // not found
                tmp.push({
                  id: from,
                  stream,
                });
              } else {
                tmp.splice(foundIndex, foundIndex + 1, stream);
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
              peers.splice(foundIndex, foundIndex + 1, {
                id: from,
                initiator: true,
                peer,
              });
            }

            console.log('### peers: ', peers);
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
      .catch((err) => console.error(err));

    const notifyLeave = () => peers.forEach(({ id: to }) => {
      console.log('student left');
      socket.send(
        JSON.stringify({
          type: 'leave_request',
          from: id,
          to,
        }),
      );
    });

    window.onbeforeunload = notifyLeave;
    return () => notifyLeave(); // eslint-disable-line
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
                Student: {roomData?.room_by_pk.name || 'unnamed room'}
              </Heading>
            </Skeleton>

            {otherStreams.map((stream: any) => (
              <Stream key={`${stream.id}-${Date.now()}`} stream={stream} />
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

export default RoomStudent;

export const getServerSideProps: SSP = async (context: SSPC) => {
  const session = await getSession(context);
  return {
    props: { session },
  };
};
