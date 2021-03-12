import { createServer } from 'https';
import { parse } from 'url';
import fs from 'fs';
import next from 'next';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const options = {
  key: fs.readFileSync('certs/localhost-key.pem'),
  cert: fs.readFileSync('certs/localhost.pem'),
};

app.prepare().then(() => {
  createServer(options, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    // const { pathname, query } = parsedUrl;
    // if (pathname === '/a') {
    //   app.render(req, res, '/a', query);
    // } else if (pathname === '/b') {
    //   app.render(req, res, '/b', query)
    // } else {
    //   handle(req, res, parsedUrl)
    // }
    handle(req, res, parsedUrl);
  }).listen(port);

  // tslint:disable-next-line:no-console
  console.log(
    `> Server listening at https://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`,
  );
});
