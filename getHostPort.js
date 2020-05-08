const { Resolver } = require('dns').promises;
const config = require('./config')
const resolver = new Resolver();
resolver.setServers([config.DNS_SERVER]);
const cache = {}

module.exports = async function (serviceName) {
    if (cache[serviceName] && cache[serviceName].expiration > +new Date) {
        console.log(`${serviceName}: Результат из кэша`)
        return cache[serviceName]
    } else {
        console.log(`${serviceName}: Результат запросим в DNS`)
    }

    try {
        const [srvRecord] = await resolver.resolveSrv(`${serviceName}.service.${config.DC}.consul`)
        const host = await resolveHost(srvRecord.name)
        console.log(`${serviceName}: resolved to `, {
            host: host,
            port: srvRecord.port
        })
        cache[serviceName] = {
            expiration: +new Date + config.EXPIRATION_TIMEOUT,
            host: host,
            port: srvRecord.port,
        }
    } catch (e) {
        if (e.code === 'ENOTFOUND') {
            //не найдено. надо сказать что больше такого сервиса нет и закэшить это
            cache[serviceName] = {
                expiration: +new Date + config.EXPIRATION_TIMEOUT,
                host: null,
                port: null,
            }
        } else {
            console.error(`${serviceName}: Ошибка поиска DNS. Отдаем из кэша`, e)

            if (cache[serviceName]) {
                console.log(`${serviceName}: Продлили кэш, пробуем переждать ошибку`)
                //если в кэше, что-то есть, то продлим кэш
                cache[serviceName] = {
                    expiration: +new Date + config.ERROR_EXPIRATION_TIMEOUT,
                    host: cache[serviceName].host,
                    port: cache[serviceName].port,
                }
            } else {
                console.log(`${serviceName}: Выкидываем как будсто сервис не найден`)
                //если в кэше ничего, то просто отдадим пустоту и закэшируем этц поустоту
                cache[serviceName] = {
                    expiration: +new Date + config.ERROR_EXPIRATION_TIMEOUT,
                    host: null,
                    port: null,
                }
            }
        }
    }

    return cache[serviceName]
}

const resolveHost = async function (host) {
    const record = await resolver.resolve(host)
    return record[0]
}
