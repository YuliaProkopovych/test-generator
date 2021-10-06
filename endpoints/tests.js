//const tests = require('../data/tests.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken');

const questionSchema = {
  type: 'object',
  properties: {
    questionText: {type: 'string'},
    answers: {type: 'string'}
  }
};

const getTestsOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            questions: {
              type: 'array',
              items: questionSchema,
            },
          },
        },
      },
    },
  },
  handler: async (req, reply) => {
    const tests = await prisma.test.findMany();
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
          questions: {
            type: 'array',
            items: questionSchema,
          },
        },
      },
    },
  },
  handler: async (req, reply) => {
    const { id } = req.params;

    const test = await prisma.test.findUnique({
      where: {
        id: id,
      },
    });

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
      required: ['questions'],
      properties: {
        questions: {
          type: 'array',
          items: questionSchema,
        }
      }
    },
    response: {
      200: { type: 'string'}, // sending a simple message as string
    },
  },
  handler: async (req, reply) => {
    const newTest = {
      author :  {
        connect: {id: req.user.id }
      },
      questions : {
        create: req.body.questions,
      },
    };
    const createTest = await prisma.test.create({ data: newTest})

    reply.send('Test added');
  }
};

const updateTestOpts = {
  headers: headerSchema,
  schema: {
    body: {
      type: 'object',
      required: ['questions'],
      items: questionSchema
    },
    params: {
      id: { type: 'number' }, // converts the id param to number
    },
    response: {
      200: { type: 'string'}, // a simple message will be sent
    },
  },
  handler: async (req, reply) => {
    const { id } = req.params;

    const updateUser = await prisma.test.update({
      where: {
        id: id,
      },
      data: req.body
    });

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
  handler: async (req, reply) => {
    const { id } = req.params;


    const deleteQuestions = prisma.question.deleteMany({
      where: {
        testId: id,
      },
    });

    const deleteTest = prisma.test.delete({
      where: {
        id: id,
      },
    });



    try {
      const transaction = await prisma.$transaction([deleteQuestions, deleteTest]);
    } catch (e) {
          console.log( e.message);
    }

    return reply.send('Test deleted');
  }
};


module.exports = testsRoute;
