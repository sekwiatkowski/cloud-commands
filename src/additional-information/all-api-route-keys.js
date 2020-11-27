import {concat, fromEntries, map} from 'standard-functions'
import {executeCommand} from '../execution'

function computeGetRoutes(apiId, token) {
    const subcommand = 'get-routes'
    const baseOptions = [
        ['api-id', apiId],
        ['max-items', 100]
    ]

    const tokenOptions = token
        ? [['starting-token', token]]
        : []

    return [subcommand, concat(baseOptions, tokenOptions)]
}

export function getAllRouteKeys(apiGatewayV2, apiId, routeKeys = [], token = undefined) {
    const [subcommand, options] = computeGetRoutes(apiId, token)

    return executeCommand(apiGatewayV2(subcommand) (options))
        .then(JSON.parse)
        .then(({ Items, NextToken }) => {
            const additionalRouteKeys = fromEntries(map(({RouteKey, RouteId}) => [RouteKey, RouteId])(Items))
            const updatedRouteKeys = {...routeKeys, ...additionalRouteKeys}

            return NextToken
                ? getAllRouteKeys(apiGatewayV2, apiId, updatedRouteKeys, NextToken)
                : updatedRouteKeys
        })
}