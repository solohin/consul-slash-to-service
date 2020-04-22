const { Resolver } = require('dns').promises;
const config = require('./config')
const resolver = new Resolver();
resolver.setServers(['127.0.0.1:8600']);
const cache = {}

module.exports = async function (serviceName) {
    if (cache[serviceName] && cache[serviceName].expiration < +new Date) {
        return cache[serviceName]
    }

    try {
        const [srvRecord] = await resolver.resolveSrv(`${serviceName}.service.${config.DC}.consul`)
        const host = await resolveHost(srvRecord.name)
        console.log(`resolved ${serviceName} to `, {
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
            console.error(`Ошибка поиска DNS для ${serviceName}. Отдаем из кэша`, e)

            if (cache[serviceName]) {
                console.log(`Продлили кэш для ${serviceName}, пробуем переждать ошибку`)
                //если в кэше, что-то есть, то продлим кэш
                cache[serviceName] = {
                    expiration: +new Date + config.ERROR_EXPIRATION_TIMEOUT,
                    host: cache[serviceName].host,
                    port: cache[serviceName].port,
                }
            } else {
                console.log(`Выкидываем как будсто сервис не найден`)
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
