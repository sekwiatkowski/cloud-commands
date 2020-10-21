import {concat} from 'compose-functions'
import {executeCommand} from '../execution'

function computeCreateRouteOptions(apiId) {
    return routeKey => integrationId => maybeAuthorizerId => {
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

        return concat([baseOptions, authorizerOptions])
    }
}

export function createApiRoute(apiGatewayV2, apiId) {
    return (routeKey, integrationId) => {
        console.log(`Creating route "${routeKey}" ...`)

        const options = computeCreateRouteOptions(apiId)(routeKey)(integrationId)(null)

        const command = apiGatewayV2('create-route')(options)

        console.log(command)

        return executeCommand(command)
    }
}
