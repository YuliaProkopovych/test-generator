const testGenerator = {
  method: 'GET',
  url: '/test-generator',
  handler: async (request, reply) => {
    reply.send({ hello: 'world' })
  }
};

module.exports = testGenerator;
