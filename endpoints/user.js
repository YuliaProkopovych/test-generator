const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken');

const userRoutes = (fastify, options, done) => {
  fastify.get('/users', getUsersOpts);
  fastify.get('/users/:id', getSingleUserOpts);
  fastify.post('/users/register', newUserOpts);
  fastify.post('/users/login', loginUserOpts);

  done();
};

const getUsersOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
          },
        },
      },
    },
  },
  handler: async (req, reply) => {
    const Users = await prisma.user.findMany();
    reply.send(Users);
  },
};

const getSingleUserOpts = {
  schema: {
    params: {
      id: { type: 'number' },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          email: { type: 'string' },
        },
      },
    },
  },
  handler: async (req, reply) => {
    const { id } = req.params;

    const User = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    reply.send(User);
  },
};

const newUserOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
    response: {
      200: { type: 'string' },
    },
  },
  handler: async (req, reply) => {
    const newUser = await prisma.user.create({data: req.body});

    reply.send('Account created successfully');
  }
}

const loginUserOpts = {
  schems : {
    body: {
      type: 'object',
      required: ['name', 'password'],
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          token: { type: 'string' },
        },
      },
    },
  },
  handler: async (req, reply) => {
    const { email, password } = req.body;

    const User = await prisma.user.findUnique(
      { where:
        { email: email }
      }
    );
    if (!User) {
      return reply.send("This User doesn't exist");
    }

    // check if password is correct
    if (password !== User.password) {
      return reply.send('Invalid credentials');
    }

    // sign a token
    jwt.sign(
      { id: User.id },
      'my_jwt_secret',
      { expiresIn: 3 * 86400 },
      (err, token) => {
        if (err) reply.status(500).send(new Error(err));

        reply.send({ token });
      }
    );
  }
}


module.exports = userRoutes;
