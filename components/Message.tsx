import { Avatar, Flex, Spacer } from '@chakra-ui/react';

type Props = {
  value: string;
  mine: boolean;
  image?: string;
};

const Message = (props: Props) => {
  const { image, value, mine } = props;

  return (
    <Flex alignItems="center">
      {mine && <Spacer />}
      {image && !mine && <Avatar size="xs" src={image} marginRight="6px" />}
      <Flex
        maxWidth="90%"
        marginY="1"
        textAlign={mine ? 'right' : 'left'}
        paddingX="3"
        paddingY="1"
        marginLeft={image ? '0' : '30px'}
        backgroundColor={mine ? 'green' : '#EEE'}
        color={mine ? '#FFF' : '#333'}
        borderTopLeftRadius="lg"
        borderTopRightRadius="lg"
        borderBottomRightRadius={mine ? 'sm' : 'lg'}
        borderBottomLeftRadius={!mine ? 'sm' : 'lg'}
      >
        {value}
      </Flex>
      {!mine && <Spacer />}
    </Flex>
  );
};

export default Message;
