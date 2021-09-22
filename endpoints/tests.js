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
  fastify.get('/tests/:id', getTestOpts); // the :id route is a placeholder for an id (indicates a parameter)
  fastify.post('/tests/new', newTestOpts);
  fastify.put('/tests/edit/:id', updateTestOpts);

  done();
};

const getTestOpts = {
  schema: {
    params: {
      id: { type: 'number' },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          body: { type: 'string' },
        },
      },
    },
  },
  handler: (req, reply) => {
    const { id } = req.params;

    const test = tests.filter((test) => {
      return test.id === id;
    })[0];

    if (!test) {
      return reply.status(404).send({
        errorMsg: 'Test not found',
      });
    }

    return reply.send(test);
  }

};

const newTestOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['title', 'body'],
      properties: {
        title: { type: 'string'},
        body: { type: 'string'},
      },
    },
    response: {
      200: { type: 'string'}, // sending a simple message as string
    },
  },
  handler: (req, reply) => {
    const { title, body } = req.body; // no body parser required for this to work

    const id = tests.length + 1; // posts is imported from cloud/posts.js
    tests.push({ id, title, body });

    reply.send('Test added');
  }
};

const updateTestOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['title', 'body'],
      properties: {
        title: { type: 'string'},
        body: { type: 'string'},
      },
    },
    params: {
      id: { type: 'number' }, // converts the id param to number
    },
    response: {
      200: { type: 'string'}, // a simple message will be sent
    },
  },
  handler: (req, reply) => {
    const { title, body } = req.body;
    const { id } = req.params;

    const test = tests.filter((ptestost) => {
      return test.id === id;
    })[0];

    if (!test) {
      return reply.status(404).send(new Error("Test doesn't exist"));
    }

    test.title = title;
    test.body = body;

    return reply.send('Test updated');
  }
};

module.exports = testsRoute;
