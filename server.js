var http = require('http');
const getHostPort = require('./getHostPort')
const RESPONSE_404 = JSON.stringify({ error: 'Instance not found' })
const config = require('./config')

http.createServer(onRequest).listen(config.PORT);


async function onRequest(client_req, client_res) {
    console.log('serve: ' + client_req.url);

    const instanceName = client_req.url.slice(1, client_req.url.indexOf('/', 1))
    console.log('instanceName', instanceName)

    const { host, port } = await getHostPort(instanceName)
    console.log('getHostPort', { host, port })

    if (host === null || port === null) {
        client_res.writeHead(404, { 'Content-Type': 'text/json' });
        client_res.write(RESPONSE_404);
        client_res.end();
        return
    }

    var options = {
        hostname: host,
        port: port,
        path: client_req.url.slice(client_req.url.indexOf('/', 1)),
        method: client_req.method,
        headers: client_req.headers
    };

    var proxy = http.request(options, function (res) {
        client_res.writeHead(res.statusCode, res.headers)
        res.pipe(client_res, {
            end: true
        });
    });

    client_req.pipe(proxy, {
        end: true
    });
}