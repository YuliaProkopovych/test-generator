const fastify = require('fastify');


const testGenerator = require('./endpoints/test-generator');

const start = async () => {
  const server = fastify({ logger: true });

  server.route(testGenerator);

  try {
    await server.listen(3000);
  } catch (e) {
    server.log.error(e, 'Unable to start the server');
  }
};

start();
