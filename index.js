const fastify = require('fastify')({ logger: true });
const config = require('./config');

const PORT = process.env.PORT || 3000;

fastify.register(require('fastify-cors'), { origin: config.corsWhiteList, credentials: true });

fastify.get('/', (req, reply) => {
  reply.send('Hello World!');
});

fastify.register(require('./endpoints/tests'));
fastify.register(require('./endpoints/admin'));


const start = async () => {
  try {
    await fastify.listen(PORT);
  } catch (e) {
    fastify.log.error(e, 'Unable to start the server');
  }
};

start();
