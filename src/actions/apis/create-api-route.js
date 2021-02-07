import {concat, fill, length, map, mapEntries, mapValues, propertyOf, zip} from 'standard-functions'
import {executeCommand} from '../../execution'
import {performSequentially} from '../../perform-sequentially'

function computeCreateRouteOptions(apiId, maybeAuthorizerId, routeKey, integrationId) {
    const baseOptions = [
        ['api-id', apiId],
        ['route-key', `"${routeKey}"`],
        ['target', `integrations/${integrationId}`]
    ]

    const authorizerOptions = maybeAuthorizerId
        ? [
            ['authorization-type', 'JWT'],
            ['authorizer-id', maybeAuthorizerId]
        ]
        : []

    return concat(baseOptions, authorizerOptions)
}

function createApiRoute(apiGatewayV2, apiId, authorizerId) {
    return (routeKey, integrationId) => {
        console.log(`Creating route "${routeKey}" ...`)

        const options = computeCreateRouteOptions(apiId, authorizerId, routeKey, integrationId)

        const command = apiGatewayV2('create-route')(options)

        return executeCommand(command).then(JSON.parse)
    }
}

export default async function createApiRoutes(apiGatewayV2, stageNames, apiIds, authorizerIds, integrations, routes) {
    console.log(`Creating routes ...`)

    const actions = map(([stageName, apiId, authorizerId, stageIntegration]) => async() => {
        console.log(`Processing the "${stageName}" stage ...`)

        const createRoute = createApiRoute(apiGatewayV2, apiId, authorizerId)

        const routeKeysAndIntegrationIds = mapValues(propertyOf(stageIntegration))(routes)

        const createRouteActions = mapEntries(([routeKey, integrationId]) => () =>
            createRoute(routeKey, integrationId)
        ) (routeKeysAndIntegrationIds)

        return performSequentially(createRouteActions)

    }) (zip(stageNames, apiIds, authorizerIds ?? fill(null) (length(stageNames)), integrations))

    return performSequentially(actions)
}