import {
  NextApiRequest as NAReq,
  NextApiResponse as NARes,
} from 'next';
import { getSession } from 'next-auth/client';

export default async (req: NAReq, res: NARes) => {
  const session = await getSession({ req });
  res.send(session);
};
