const tests = require('../data/tests.js');

const getTestsOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            body: { type: 'string' },
          },
        },
      },
    },
  },
  handler: (req, reply) => {
    reply.send(tests);
  },
};

const testsRoute = (fastify, options, done) => {
  fastify.get('/tests', getTestsOpts);

  done();
};

module.exports = testsRoute;
