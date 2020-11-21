import {
    concat,
    first,
    joinWithComma,
    keys,
    map,
    splitBySpace,
    surroundWithDoubleQuotes,
    unique
} from 'standard-functions'
import {executeCommand} from '../../execution'

function computeBaseOptions(name, description) {
    return [
        ['name', surroundWithDoubleQuotes(name)],
        ['description', surroundWithDoubleQuotes(description)],
        ['protocol-type', 'HTTP']
    ]
}

function computeCorsOptions(allowedHeaders, routes) {
    if (!allowedHeaders) {
        return []
    }

    const routeKeys = keys(routes)

    const splits = map(splitBySpace)(routeKeys)

    const methods = map(first)(splits)

    const uniqueMethods = unique(methods)

    return [
        ['cors-configuration', `AllowOrigins=*,AllowMethods=${joinWithComma(uniqueMethods)},AllowHeaders=${joinWithComma(allowedHeaders)}` ]
    ]
}

function computeCreateApiOptions(name, description, cors, routes) {
    const baseOptions = computeBaseOptions(name, description)

    const corsOptions = computeCorsOptions(cors, routes)

    const options = concat([baseOptions, corsOptions])

    return options
}

export function createApi(apiGatewayV2, {name, description, cors, routes}) {
    console.log(`Creating API ${name} ...`)

    const options = computeCreateApiOptions(name, description, cors, routes)

    const command = apiGatewayV2('create-api') (options)

    console.log(command)

    return executeCommand(command).then(JSON.parse)
}
