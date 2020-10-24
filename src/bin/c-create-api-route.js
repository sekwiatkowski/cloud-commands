#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import {findApiIdByName} from '../additional-information/api-id'
import {createAwsCli} from '../aws-cli'
import {parseApiRoutes} from '../cli-arguments'
import {createApiRoutes} from '../actions/create-api-route'
import {mapValues, propertyOf, unique, values} from 'compose-functions'
import {findIntegrationIdsByNames} from '../additional-information/integration-id'

(async () => {
    const { api, profile, region } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, routes } = api

    const specifiedRoutes = parseApiRoutes(routes)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const id = await findApiIdByName(apiGatewayV2, name)

    const usedFunctions = unique(values(specifiedRoutes))
    const integrationIds = await findIntegrationIdsByNames(apiGatewayV2, id, usedFunctions)
    const routeKeysAndIntegrationIds = mapValues(propertyOf(integrationIds))(specifiedRoutes)

    await createApiRoutes(apiGatewayV2, id, routeKeysAndIntegrationIds)
})()