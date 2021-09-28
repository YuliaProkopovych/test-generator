const tests = require('../data/tests.js');

const jwt = require('jsonwebtoken');

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

  fastify
  .register(require('fastify-auth'))
  .after(() => privateTestRoutes(fastify));
  done();
};

const privateTestRoutes = (fastify) => {
  // create a new post
  fastify.post('/tests/new', {
    preHandler: fastify.auth([verifyToken]),
    ...newTestOpts,
  });

  // update a post
  fastify.put('/tests/edit/:id', {
    preHandler: fastify.auth([verifyToken]),
    ...updateTestOpts,
  });

  // delete a post
  fastify.delete('/tests/:id', {
    preHandler: fastify.auth([verifyToken]),
    ...deleteTestOpts,
  });
};

const verifyToken = (req, reply, done) => {
  const { token } = req.headers;

  jwt.verify(token, 'my_jwt_secret', (err, decoded) => {
    if (err) {
      done(new Error('Unauthorized'));
    }

    req.user = {
      id: decoded.id, // pass in the user's info
    };
  });

  done();
};

const headerSchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string' },
  },
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
  headers: headerSchema,
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
  headers: headerSchema,
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

    const test = tests.filter((test) => {
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

const deleteTestOpts = {
  headers: headerSchema,
  schema: {
    params: {
      id: { type: 'number' }, // converts the id param to number
    },
    response: {
      200: { type: 'string' },
    },
  },
  handler: (req, reply) => {
    const { id } = req.params;

    const testIndex = tests.findIndex((test) => {
      return test.id === id;
    });

    if (testIndex === -1) {
      return reply.status(404).send(new Error("Test doesn't exist"));
    }

    tests.splice(testIndex, 1);

    return reply.send('Test deleted');
  }
};


module.exports = testsRoute;
