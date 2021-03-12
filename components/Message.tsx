import { Flex, Spacer } from '@chakra-ui/react';

type Props = {
  value: string;
  mine: boolean;
};

const Message = (props: Props) => {
  const { value, mine } = props;

  return (
    <Flex>
      {mine && <Spacer />}
      <Flex
        maxWidth="90%"
        marginY="1"
        textAlign={mine ? 'right' : 'left'}
        paddingX="4"
        paddingY="2"
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

Message.defaultProps = {
};

export default Message;
