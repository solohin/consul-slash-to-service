// libs
const request = require('request-promise');
// modules
const config = require('./config');
// init
let cache = {};

module.exports = async function(instanceId) {
    if (!cache[instanceId]) {
        let options = {
            method:'GET',
            json: true,
            uri: `http://116.203.192.130:8080/v1/catalog/service/instance${instanceId}-mqtt`,
            auth: {
                'user': 'admin',
                'pass': '70b7423bt7'
            }
        };
        let result = (await request(options))[0];

        if (result) {
            cache[instanceId] = {
                expiration: +new Date + config.EXPIRATION_TIMEOUT,
                host: result.ServiceAddress,
                port: result.ServicePort
            }
        }
    }

    return cache[instanceId];
};

setInterval(() => {
    let keys = [];
    for (let key of Object.keys(cache)) {
        if (cache[key] && cache[key].expiration && cache[key].expiration < Date.now()) {
            keys.push(key);
        }
    }
    for (let key of keys) {
        delete cache[key];
    }
}, 60 * 1000);
