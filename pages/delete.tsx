import { Box, Center, Layout } from 'components';

export default function DeletePage(): JSX.Element {
  return (
    <Layout protect={false}>
      <Box height="100%" width="100%" display="flex">
        <Center>
          Contact sangdth@gmail.com to delete your information
        </Center>
      </Box>
    </Layout>
  );
}
