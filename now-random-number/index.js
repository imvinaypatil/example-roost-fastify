module.exports = (req, res) => {
  const body = JSON.stringify({ randomNumber: Math.floor(Math.random() * 100) })
  res
    .writeHead(200, {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': 'application/json'
    })
  res.end(body);
}
