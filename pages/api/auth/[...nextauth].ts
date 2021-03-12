import {
  NextApiRequest as NAReq,
  NextApiResponse as NARes,
} from 'next';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import jwt from 'jsonwebtoken';

import { syncUser } from '../../../lib/helpers';

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
const options = {
  // https://next-auth.js.org/configuration/providers
  providers: [
    Providers.Facebook({
      clientId: process.env.FACEBOOK_ID || '',
      clientSecret: process.env.FACEBOOK_SECRET || '',
    }),
  ],
  // Database optional. MySQL, Maria DB, Postgres and MongoDB are supported.
  // https://next-auth.js.org/configuration/databases
  //
  // Notes:
  // * You must to install an appropriate node_module for your database
  // * The Email provider requires a database (OAuth providers do not)
  // Don't know why can't connect to AWS RDS, got timeout error
  // database: process.env.DATABASE_URL || '',

  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a separate secret is defined explicitly for encrypting the JWT.
  secret: process.env.SECRET,

  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `jwt` is automatically set to `true` if no database is specified.
    jwt: true,

    // Seconds - How long until an idle session expires and is no longer valid.
    // maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // A secret to use for key generation (you should set this explicitly)
    secret: process.env.SECRET,
    // Set to true to use encryption (default: false)
    // encryption: true,
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    encode: async ({ secret, token }: any) => {
      const jwtClaims = {
        sub: token.sub.toString(),
        name: token.name,
        email: token.email,
        picture: token.picture,
        iat: Math.floor(Date.now() / 1000) - 10, // fallback 10s to prevent skew
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        'https://hasura.io/jwt/claims': {
          'x-hasura-allowed-roles': ['user', 'admin'],
          'x-hasura-default-role': 'user',
          'x-hasura-role': 'admin',
          'x-hasura-user-id': token.sub,
        },
      };
      const encodedToken = jwt.sign(jwtClaims, secret, { algorithm: 'HS256' });
      return encodedToken;
    },
    decode: async ({ secret, token }: any) => {
      const decodedToken = jwt.verify(token, secret, { algorithms: ['HS256'] });
      return decodedToken as Record<string, any>; // bypass the type error by @types/jsonwebtoken
    },
  },

  // https://next-auth.js.org/configuration/pages
  pages: {
    // signIn: '/api/auth/signin',  // Displays signin buttons
    // signOut: '/api/auth/signout', // Displays form with sign out button
    // error: '/api/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/api/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    // async signIn(user: any, account: any, profile: any) { return true; },
    // async redirect(url, baseUrl) { return baseUrl },
    async session(session: any, token: any) {
      const encodedToken = jwt.sign(token, process.env.SECRET || '', { algorithm: 'HS256' });

      // Get the user from database and return it back to sesssion to use
      const richUserProfile = await syncUser(encodedToken, session.user);

      const encodedSession = {
        ...session,
        user: richUserProfile,
        id: token.sub,
        token: encodedToken,
        user_id: richUserProfile.id,
        custom: 'custom',
      };

      return Promise.resolve(encodedSession);
      // TODO: this func return only User type really basic, how to extends it
      // based on @types/next-auth I believe
    },
    async jwt(token: any) {
      return Promise.resolve(token);
    },
  },

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  events: {},

  // Enable debug messages in the console if you are having problems
  debug: process.env.NODE_ENV !== 'production',
};

export default (req: NAReq, res: NARes) => NextAuth(req, res, options);
