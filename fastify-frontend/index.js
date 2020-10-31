const Fastify = require('fastify')
const hyperid = require('hyperid')
const fetchPlugin = require('./fastify-fetch')
const ZIPKIN = process.env.ZIPKIN || 'localhost:9411';
const Zipkin = require('zipkin-lite');
const zipkin = new Zipkin({
  zipkinHost: ZIPKIN,
  serviceName: 'fastify-frontend', servicePort: process.env.PORT || 3000, serviceIp: '0.0.0.0',
  init: 'short'
});

const generator = hyperid()

const fastify = Fastify({
  logger: {
    serializers: {
      req (req) {
        return {
          method: req.method,
          url: req.url,
          hostname: req.hostname,
          path: req.path,
          parameters: req.parameters,
          "x-request-id": req.headers['x-request-id'],
          "x-b3-traceid": req.headers['x-b3-traceid'],
          "x-b3-spanid": req.headers['x-b3-spanid'],
          "x-b3-parentspanid": req.headers['x-b3-parentspanid'],
          "x-b3-sampled": req.headers['x-b3-sampled'],
          "x-b3-flags": req.headers['x-b3-flags'],
          "x-ot-span-context": req.headers['x-ot-span-context']
        }
      }
    }
  },
  genReqId: req => req.headers['x-request-id'] || generator()
})

const backendUrl = process.env.BACKEND_URL || 'http://0.0.0.0:3001'

fastify.register(fetchPlugin);
fastify.addHook('onRequest', zipkin.onRequest());
fastify.addHook('onResponse', zipkin.onResponse());

fastify.addHook('onRequest', (req, res, done) => {
  req.headers['x-request-id'] = req.id;
  done()
})

// Declare a route
fastify.get('/', async (request, reply) => {
  request.log.info("request received", request.headers);

  request.zipkin.setName('fatstify-frontend-get-root');
  const zreq = request.zipkin.prepare();
  const url = `${backendUrl}?name=${request.query.name || 'DEFAULT'}`;

  const req = await request.fetch(url, { headers: { "Content-Type": "application/json", ...zreq.headers } })
  const { randomNumber, id, hello } = await req.json()

  zreq.complete('GET', url);
  fastify.log.info(`got a random number, ${randomNumber} for id ${id}. our id was ${request.id}`)
  reply.type('text/html')
  return `<!DOCTYPE html><html><body><h1>Hi ${hello}, Your req id was ${request.id}, when we forwarded we got ${id} back. We generated ${randomNumber} for you.</h1></body></html>`
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