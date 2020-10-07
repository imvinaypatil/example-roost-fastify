const Fastify = require('fastify');
const fetchPlugin = require('./fastify-fetch')

const i = 0;
const fastify = Fastify({
  logger: {
    serializers: {
      req (req) {
        return {
          method: req.method,
          url: req.url,
          hostname: req.hostname,
          path: req.path,
          parameters: req.parameters
        }
      }
    }
  }
})

fastify.register(fetchPlugin)

// Declare a route
fastify.get('/', async (request, reply) => {
  fastify.log.info(`got a request`)
  let req = await request.fetch('https://now-random-number.thekemkid.now.sh/', { headers: { "Content-Type": "application/json" } })
  let { randomNumber } = await req.json()
  fastify.log.info(`got a random number, ${randomNumber}`)
  return { hello: request.query.name || 'world', id: request.id, randomNumber }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(process.env.PORT || 3000, '0.0.0.0')
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
