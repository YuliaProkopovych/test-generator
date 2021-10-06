const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jwt = require('jsonwebtoken');

const adminRoutes = (fastify, options, done) => {
  fastify.get('/admins', getAdminsOpts);
  fastify.post('/admins/register', newAdminOpts);
  fastify.post('/admins/login', loginAdminOpts);

  done();
};

const getAdminsOpts = {
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
    const admins = await prisma.user.findMany();
    reply.send(admins);
  },
};

const newAdminOpts = {
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

const loginAdminOpts = {
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

    const admin = await prisma.user.findUnique(
      { where:
        { email: email }
      }
    );
    if (!admin) {
      return reply.send("This admin doesn't exist");
    }

    // check if password is correct
    if (password !== admin.password) {
      return reply.send('Invalid credentials');
    }

    // sign a token
    jwt.sign(
      { id: admin.id },
      'my_jwt_secret',
      { expiresIn: 3 * 86400 },
      (err, token) => {
        if (err) reply.status(500).send(new Error(err));

        reply.send({ token });
      }
    );
  }
}


module.exports = adminRoutes;
