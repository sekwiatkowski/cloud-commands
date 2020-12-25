import {
    concat,
    first,
    joinWithComma,
    joinWithEqualitySign,
    keys,
    map,
    mapEntries,
    mergeRecursively,
    splitBySpace,
    surroundWithDoubleQuotes,
    unique
} from 'standard-functions'
import {executeCommand} from '../../execution'
import {performSequentially} from '../../perform-sequentially'
import combineApiAndStageName from '../../api-name'

function computeBaseOptions(name, description) {
    return [
        ['name', surroundWithDoubleQuotes(name)],
        ['description', surroundWithDoubleQuotes(description)],
        ['protocol-type', 'HTTP']
    ]
}

function computeCorsOptions(configuration, routes) {
    if (!configuration) {
        return []
    }

    const routeKeys = keys(routes)
    const splits = map(splitBySpace)(routeKeys)
    const methods = map(first)(splits)
    const uniqueMethods = unique(methods)

    const { origins, allowHeaders, exposeHeaders, credentials } = configuration

    const setEqual = (name, value) => joinWithEqualitySign(name, value)
    const wildcardOrList = value => value === '*' ? '*' : joinWithComma(value)

    const corsConfigurationValue = joinWithComma(
        setEqual('AllowOrigins', wildcardOrList(origins)),
        setEqual('AllowMethods', joinWithComma(uniqueMethods)),
        setEqual('AllowHeaders', wildcardOrList(allowHeaders)),
        setEqual('ExposeHeaders', wildcardOrList(exposeHeaders)),
        setEqual('AllowCredentials', credentials ? 'true' : 'false')
    )

    return [
        ['cors-configuration', corsConfigurationValue ]
    ]
}

function computeCreateApiOptions(name, description, cors, routes) {
    const baseOptions = computeBaseOptions(name, description)

    const corsOptions = computeCorsOptions(cors, routes)

    const options = concat(baseOptions, corsOptions)

    return options
}

export function createApi(apiGatewayV2, {name, description, cors, routes, stages}) {
    console.log(`Creating "${name}" APIs ...`)

    const actions = mapEntries(([_, stage]) => () => {
        console.log(`Creating the ${stage.name} API ...`)

        const combineCors = mergeRecursively(cors ?? {}, stage.cors ?? {})

        const combinedName = combineApiAndStageName(name) (stage.name)
        const createOptions = computeCreateApiOptions(combinedName, description, combineCors, routes)

        const command = apiGatewayV2('create-api') (createOptions)
        console.log(command)

        return executeCommand(command).then(JSON.parse)
    }) (stages)

    return performSequentially(actions)
}
