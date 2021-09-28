const admins = require('../data/admins');

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
  handler: (req, reply) => {
    reply.send(admins);
  },
};

const newAdminOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['username', 'email', 'password'],
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
  handler: (req, reply) => {
    const { username, email, password } = req.body;
    const id = admins.length + 1;

    admins.push({
      id,
      username,
      email,
      password, // you can hash the password if you want
    });

    reply.send('Account created successfully');
  }
}

const loginAdminOpts = {
  schems : {
    body: {
      type: 'object',
      required: ['username', 'password'],
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
  handler: (req, reply) => {
    const { username, password } = req.body;

    const admin = admins.filter((admin) => {
      return admin.username === username;
    })[0];

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
