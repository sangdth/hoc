import { useState } from 'react';
import {
  Flex,
  InputGroup,
  Input,
  InputRightElement,
  Skeleton,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { UserProfile } from 'lib/types';

import Message from './Message';

type MessageType = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  text: string;
  room_id: string;
};

type Props = {
  messages: MessageType[];
  user: UserProfile;
  isTyping: boolean;
};

const ChatWidget = (props: Props) => {
  const { messages, isTyping, user } = props;

  const [value, setValue] = useState('');

  return (
    <Flex
      direction="column"
      height="100%"
      marginLeft="4"
      maxWidth="360"
    >
      <Flex
        direction="column"
        height="100%"
      >
        {messages.map((o: MessageType) => (
          <Message
            value={o.text}
            mine={o.user_id === user.id}
          />
        ))}
      </Flex>
      {isTyping && <Skeleton h="20px" w="30%" isLoaded={!isTyping} />}
      <InputGroup>
        <Input
          placeholder="Enter message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {value && (
        <InputRightElement>
          <ArrowForwardIcon color="green.500" />
        </InputRightElement>
        )}
      </InputGroup>
    </Flex>
  );
};

export default ChatWidget;
