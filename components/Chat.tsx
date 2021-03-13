import { useEffect, useState } from 'react';
import {
  Flex,
  InputGroup,
  Input,
  InputRightElement,
  Skeleton,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useKeyPress } from 'lib/helpers';
import { UserProfile } from 'lib/types';

import Message from './Message';

type MessageType = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  text: string;
  room_id?: string;
  user: UserProfile;
};

type Props = {
  messages: MessageType[];
  currentUser: UserProfile;
  isTyping: boolean;
  onSend: (t: string) => void;
};

const ChatWidget = (props: Props) => {
  const {
    messages,
    isTyping,
    currentUser,
    onSend,
  } = props;

  const [value, setValue] = useState('');
  const [isFocused, setFocus] = useState(false);
  const [isPressed] = useKeyPress('Enter');

  useEffect(() => {
    if (isFocused && isPressed && value) {
      onSend(value);
      setValue('');
    }
  }, [isFocused, isPressed, value, onSend]);

  return (
    <Flex
      direction="column"
      height="100%"
      marginLeft="4"
      width="360px"
    >
      <Flex
        direction="column"
        height="100%"
      >
        {messages.map((o: MessageType) => (
          <Message
            key={o.id}
            value={o.text}
            mine={o.user.id === currentUser.id}
          />
        ))}
      </Flex>
      {isTyping && <Skeleton h="20px" w="30%" isLoaded={!isTyping} />}
      <InputGroup>
        <Input
          placeholder="Enter message..."
          value={value}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
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
