const fp = require('fastify-plugin');
const fetch = require('node-fetch');
const http = require('http');
const https = require('https');

function setup (fastify, { agentOpts = {}, fetchOpts = {} } = { agentOpts: {}, fetchOpts: {} }, next) {
  const httpsAgentOpts = Object.assign({}, agentOpts, {
    keepAlive: true,
    keepAliveMsecs: 60000,
    maxSockets: 1024,
    maxFreeSockets: 256,
    timeout: 6000,
    maxCachedSessions: 1024
  });
  // pick the keys we want to keep for http agent
  const httpAgentOpts = ({keepAlive, keepAliveMsecs, maxSockets, maxFreeSockets, timeout} = httpsAgentOpts);
  const fastifyFetchAgents = {
    http: new http.Agent(httpAgentOpts),
    https: new https.Agent(httpsAgentOpts)
  };

  const headers = [
    "x-request-id",
    "x-b3-traceid",
    "x-b3-spanid",
    "x-b3-parentspanid",
    "x-b3-sampled",
    "x-b3-flags",
    "x-ot-span-context"
  ]

  fastify.decorateRequest('fetch', function(url, args = {}) {
    const isHttp = /^http:\/\//.test(url);

    const propagate = {}

    for (let key of headers) {
      if (this.headers[key]) {
        propagate[key] = this.headers[key]
      }
    }

    return fetch(url, {
      agent: fastifyFetchAgents[isHttp ? 'http' : 'https'],
      ...fetchOpts,
      ...args,
      headers: {
        ...fetchOpts.headers,
        ...propagate,
        ...args.headers
      }
    });
  });

  next();
}

module.exports = fp(setup);
