var http = require('http');
const getHostPort = require('./getHostPort')
const uuidv4 = require('uuid').v4
const config = require('./config')

http.createServer(onRequest).listen(config.PORT);

console.log("Config", config)
//register in consul


async function onRequest(client_req, client_res) {
    const requestId = uuidv4()
    console.log('serve: ' + client_req.url, 'requestId:', requestId);

    if (client_req.url.indexOf('/', 1) === -1) {
        client_res.writeHead(404, { 'Content-Type': 'text/json' });
        client_res.write(JSON.stringify({ error: 'Instance not found', requestId }));
        client_res.end();
        return
    }

    const instanceName = client_req.url.slice(1, client_req.url.indexOf('/', 1))
    console.log('instanceName', instanceName)

    const hostPort = await getHostPort(instanceName)

    //подставим фоллбэк
    const host = hostPort.host || config.DEFAULT_HOST
    const port = hostPort.port || config.DEFAULT_PORT

    console.log('getHostPort', { host, port })

    //не надо сокращать путь, если фоллбэк
    const path = (hostPort.host === null || hostPort.port === null)
        ? client_req.url
        : client_req.url.slice(client_req.url.indexOf('/', 1))


    if (host === null || port === null) {
        client_res.writeHead(404, { 'Content-Type': 'text/json' });
        client_res.write(JSON.stringify({ error: 'Instance not found', requestId }));
        client_res.end();
        return
    }

    var options = {
        hostname: host,
        port: port,
        path: path,
        method: client_req.method,
        headers: client_req.headers
    };

    var proxyRequest = http.request(options, function (res) {
        res.headers['X-Api-Origin'] = host.slice(0, -3) + '*'.repeat(3)
        res.headers['X-Api-Requiest-Id'] = requestId
        client_res.writeHead(res.statusCode, res.headers)

        res.pipe(client_res, {
            end: true
        })
    });

    proxyRequest.on('error', function (e) {
        console.error('proxyRequest error: ' + e, e)
        //TODO перенаправить на дефолтный

        client_res.writeHead(503, { 'Content-Type': 'text/json' });
        client_res.write(JSON.stringify({ error: 'Service Temporary Unavailable Error', requestId }));
        client_res.end();

    })

    client_req.pipe(proxyRequest, {
        end: true
    });
}

process.on('uncaughtException', function (err) {
    console.error("" + err, err.stack);
    console.log("Поймали uncaughtException");
});