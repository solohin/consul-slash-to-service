module.exports = {
    DC: process.env.DC || "nbg1",//TODO dc1,
    EXPIRATION_TIMEOUT: parseInt(process.env.EXPIRATION_TIMEOUT) || 15 * 1000,
    ERROR_EXPIRATION_TIMEOUT: parseInt(process.env.ERROR_EXPIRATION_TIMEOUT) || 5 * 1000,
}