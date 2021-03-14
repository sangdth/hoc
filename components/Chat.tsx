import {
  useEffect,
  useRef,
  useState,
} from 'react';
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
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && isPressed && value) {
      onSend(value);
      setValue('');
    }
    chatRef.current?.scrollIntoView();
  }, [isFocused, isPressed, value, onSend]);

  const shouldShowImage = (i: number) => {
    const cm = messages[i]; // eslint-disable-line
    const nm = messages[i + 1];
    if (cm.user.id !== nm?.user.id) {
      return cm.user.image;
    }

    return '';
  };

  return (
    <Flex
      direction="column"
      height="100%"
      marginLeft="4"
      width="360px"
      overflow="hidden"
    >
      <Flex
        direction="column"
        height="100%"
        overflowY="scroll"
        paddingRight="5px"
        paddingBottom="5px"
      >
        {messages.map((o: MessageType, i: number) => (
          <Message
            key={o.id}
            value={o.text}
            mine={o.user.id === currentUser.id}
            image={shouldShowImage(i)}
          />
        ))}
        <Skeleton
          h="20px"
          w="30%"
          isLoaded={!isTyping}
          ref={chatRef}
        />
      </Flex>
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
