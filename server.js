var http = require('http');
const getHostPort = require('./getHostPort')
const RESPONSE_404 = JSON.stringify({ error: 'Instance not found' })
const RESPONSE_503 = JSON.stringify({ error: 'Service Unavailable Error' })
const config = require('./config')

http.createServer(onRequest).listen(config.PORT);

//register in consul


async function onRequest(client_req, client_res) {
    console.log('serve: ' + client_req.url);

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
        client_res.write(RESPONSE_404);
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

    var proxy = http.request(options, function (res) {
        res.headers['X-Api-Origin'] = host.slice(0, -3) + '*'.repeat(3)
        client_res.writeHead(res.statusCode, res.headers)

        res.on('error', function (e) {
            console.error('Pipe ошибка err')
            //TODO перенаправить на дефолтный

            client_res.writeHead(503, { 'Content-Type': 'text/json' });
            client_res.write(RESPONSE_503);
            client_res.end();

        }).pipe(client_res, {
            end: true
        });
    });

    client_req.pipe(proxy, {
        end: true
    });
}

process.on('uncaughtException', function (err) {
    console.error("" + err, err.stack);
    console.log("Поймали uncaughtException");
});