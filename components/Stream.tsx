/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef } from 'react';

type Props = {
  stream: any;
};

const Stream = (props: Props) => {
  const ref = useRef<HTMLVideoElement>(null);

  const { stream } = props;

  useEffect(() => {
    const { current: video } = ref;
    if (video) {
      video.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      style={{ width: '680px' }}
    />
  );
};

export default Stream;
