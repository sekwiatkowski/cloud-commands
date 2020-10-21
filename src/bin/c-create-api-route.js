#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import {findApiIdByName} from '../additional-information/api-id'
import {createAwsCli} from '../aws-cli'
import {parseApiRoutes} from '../cli-arguments'
import {findIntegrationIdsByNames} from '../additional-information/integration-id'
import {createApiRoute} from '../actions/create-api-route'
import {entries, map, mapValues, propertyOf, unique, values} from 'compose-functions'
import {performSequentially} from '../perform-sequentially'

(async () => {
    const { api, profile, region } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, routes } = api

    const specifiedRoutes = parseApiRoutes(routes)

    const usedFunctions = unique(values(specifiedRoutes))

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const apiId = await findApiIdByName(apiGatewayV2, name)

    const integrationIds = await findIntegrationIdsByNames(apiGatewayV2, apiId, usedFunctions)

    const routeKeysAndIntegrationIds = mapValues(propertyOf(integrationIds))(specifiedRoutes)

    const createRoute = createApiRoute(apiGatewayV2, apiId)

    const actions = map(([routeKey, integrationId]) => () => createRoute(routeKey, integrationId))(entries(routeKeysAndIntegrationIds))

    performSequentially(actions)
})()