import {entries, map} from 'standard-functions'
import {performSequentially} from '../../perform-sequentially'
import {executeCommand} from '../../execution'

function computeDeleteApiRouteOptions(apiId, routeId) {
    return [
        ['api-id', apiId],
        ['route-id', routeId]
    ]
}

function deleteApiRoute(apiGatewayV2, apiId) {
    return (serializedRouteKey, routeId) => {
        console.log(`Deleting API route ${serializedRouteKey} ...`)

        const options = computeDeleteApiRouteOptions(apiId, routeId)

        const command = apiGatewayV2('delete-route') (options)

        console.log(command)

        return executeCommand(command)
    }
}

export function deleteApiRoutes(apiGatewayV2, apiId, serializedRouteKeysAndIds) {
    const deleteRoute = deleteApiRoute(apiGatewayV2, apiId)

    const actions = map(([routeKey, routeId]) => () => deleteRoute(routeKey, routeId)) (entries(serializedRouteKeysAndIds))

    return performSequentially(actions)
}