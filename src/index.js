const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Content-Type'],
        exposedHeaders: ['Accept', 'Content-Type'],
        additionalHeaders: ['X-Requested-With'],
      },
    },
  });

  server.route(routes);

  await server.start();
  console.log(`Bookshelf API running at ${server.info.uri}`);
};

init();
