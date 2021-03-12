import { Box, Center, Layout } from 'components';

export default function PrivacyPage(): JSX.Element {
  return (
    <Layout protect={false}>
      <Box height="100%" width="100%" display="flex">
        <Center>
          We store only public information from Facebook that you use to login.
          If you do not want, delete your account.
        </Center>
      </Box>
    </Layout>
  );
}
