import {
  GetServerSideProps as SSP,
  GetServerSidePropsContext as SSPC,
} from 'next';
import { getSession } from 'lib/helpers';
import { Box, Center, Layout } from 'components';

export default function IndexPage(): JSX.Element {
  /* useEffect(() => { */
  /*   if (userInRoom?.user.length === 0 */
  /*       || userInRoom?.user?.some((o: any) => o.email !== session?.user?.email) */
  /*   ) { */
  /*     joinRoom({ */
  /*       variables: { */
  /*         object: { */
  /*           room_id: process.env.NEXT_PUBLIC_ROOM_ID, */
  /*           user_id: session?.user_id, */
  /*         }, */
  /*       }, */
  /*     }); */
  /*   } */
  /* }, [joinRoom, leaveRoom, userInRoom, session]); */

  /* } else { */
  /*   leaveRoom({ */
  /*     variables: { */
  /*       room_id: process.env.NEXT_PUBLIC_ROOM_ID, */
  /*       user_id: session?.user_id, */
  /*     }, */
  /*   }); */
  return (
    <Layout>
      <Box height="100%" width="100%" display="flex">
        <Center>
          Homepage
        </Center>
      </Box>
    </Layout>
  );
}

// (Server-side Rendering): Fetch data on each request.
export const getServerSideProps: SSP = async (context: SSPC) => {
  const session = await getSession(context);
  return {
    props: { session },
  };
};
