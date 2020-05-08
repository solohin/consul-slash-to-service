const mockery = require('mockery')

//TODO переписать эту херню на jest

mockery.enable();
const getHostPort = function (serviceName) {
    console.log(`Фейковый getHostPort для ${serviceName}`)
    if (serviceName === "died") {
        return {
            host: '127.0.0.1',
            port: 9876
        }
    }
    console.error("getHostPort не замокан корректно")
    process.exit(1)
}
mockery.registerMock('./getHostPort', getHostPort);

require('./server.js')