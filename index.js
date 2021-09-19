const fastify = require('fastify')({ logger: true });

const PORT = process.env.PORT || 3000;


//const loginRoute = require('./endpoints/login');
const testsRoute = require('./endpoints/tests');

fastify.get('/', (req, reply) => {
  reply.send('Hello World!');
});

//fastify.route(loginRoute);
fastify.register(require('./endpoints/tests')); // we will be working with posts.js only for now

const start = async () => {
  //const server = fastify({ logger: true });

  // fastify.get('/', (req, reply) => {
  //   reply.send('Hello World!');
  // });

  try {
    await fastify.listen(PORT);
  } catch (e) {
    fastify.log.error(e, 'Unable to start the server');
  }
};

start();
