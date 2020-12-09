import {entries, map, zip} from 'standard-functions'
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
        console.log(`Deleting "${serializedRouteKey}" route ...`)

        const options = computeDeleteApiRouteOptions(apiId, routeId)

        const command = apiGatewayV2('delete-route') (options)

        console.log(command)

        return executeCommand(command)
    }
}

export function deleteApiRoutes(apiGatewayV2, stageNames, apiIds, routeKeysAndIds) {
    console.log('Deleting routes ...')

    const actions = map(([ stageName, apiId, stageRouteKeysAndIds]) => () => {
        console.log(`Processing "${stageName}" stage ...`)

        const deleteRoute = deleteApiRoute(apiGatewayV2, apiId)

        const stageActions = map(([routeKey, routeId]) =>
            () => deleteRoute(routeKey, routeId)) (entries(stageRouteKeysAndIds)
        )

        return performSequentially(stageActions)

    }) (zip(stageNames, apiIds, routeKeysAndIds))

    return performSequentially(actions)
}