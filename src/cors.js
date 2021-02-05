import {first, joinWithComma, joinWithEqualitySign, keys, map, splitBySpace, unique} from 'standard-functions'

export default function computeCorsOptions(configuration, routes) {
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
