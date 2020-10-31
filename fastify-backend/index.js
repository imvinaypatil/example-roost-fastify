const Fastify = require('fastify');
const fetchPlugin = require('./fastify-fetch')
const hyperid = require('hyperid')
const ZIPKIN = process.env.ZIPKIN || 'localhost:9411';
const Zipkin = require('zipkin-lite');
const zipkin = new Zipkin({
  zipkinHost: ZIPKIN,
  serviceName: 'fastify-backend', servicePort: process.env.PORT || 3000, serviceIp: '0.0.0.0',
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

fastify.register(fetchPlugin)
fastify.addHook('onRequest', zipkin.onRequest());
fastify.addHook('onResponse', zipkin.onResponse());
fastify.addHook('onRequest', (req, res, done) => {
  req.headers['x-request-id'] = req.id;
  done()
})

// Declare a route
fastify.get('/', async (request, reply) => {
  request.log.info("request received", request.headers);

  request.zipkin.setName('fatstify-backend-get-root');
  const zreq = request.zipkin.prepare();
  const url = 'https://now-random-number.thekemkid.now.sh/';

  let req = await request.fetch(url, { headers: { "Content-Type": "application/json", ...zreq.headers } })
  let { randomNumber } = await req.json()

  zreq.complete('GET', url);
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
