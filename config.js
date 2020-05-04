module.exports = {
    DC: process.env.DC || "nbg1",//TODO dc1,
    EXPIRATION_TIMEOUT: parseInt(process.env.EXPIRATION_TIMEOUT) || 15 * 1000,
    ERROR_EXPIRATION_TIMEOUT: parseInt(process.env.ERROR_EXPIRATION_TIMEOUT) || 5 * 1000,
    DNS_SERVER: process.env.DNS_SERVER || '127.0.0.1:8600',
    PORT: parseInt(process.env.PORT) || 3000,
    HOST: parseInt(process.env.HOST) || '127.0.0.1',
    DEFAULT_HOST: process.env.DEFAULT_HOST || null,
    DEFAULT_PORT: process.env.DEFAULT_PORT || null,
}
console.log("Config", module.exports)