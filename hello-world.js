const Fastify = require('fastify')
const hyperid = require('hyperid')

const generator = hyperid()


const fastify = Fastify({
  logger: true,
  genReqId: req => req.id || generator()
})

// Declare a route
fastify.get('/', async (request, reply) => {
  console.log(request.headers['request-id'], request.id)
  return { hello: 'world' }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()