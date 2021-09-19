const login = {
  method: 'GET',
  url: '/login',
  handler: async (request, reply) => {
    reply.send({ hello: 'world' })
  }
};

module.exports = login;
