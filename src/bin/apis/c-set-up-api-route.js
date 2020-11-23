#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {findApiIdByName} from '../../additional-information/api-id'
import {createAwsCli} from '../../aws-cli'
import {parseApiRoutes} from '../../cli-arguments'
import {createApiRoutes} from '../../actions/apis/create-api-route'
import {mapValues, propertyOf, unique, values} from 'standard-functions'
import {findIntegrationIdsByNames} from '../../additional-information/integration-id'
import grantInvokePermissionToRoutes from '../../actions/apis/grant-invoke-permission-to-routes'
import {computeArn} from '../../arns'

(async () => {
    const { profile, accountId, region, api } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, routes, stages } = api

    const specifiedRoutes = parseApiRoutes(routes)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const apiId = await findApiIdByName(apiGatewayV2, name)

    const usedFunctions = unique(values(specifiedRoutes))
    const integrationIds = await findIntegrationIdsByNames(apiGatewayV2, apiId, usedFunctions)
    const routeKeysAndIntegrationIds = mapValues(propertyOf(integrationIds))(specifiedRoutes)

    await createApiRoutes(apiGatewayV2, apiId, routeKeysAndIntegrationIds)

    const lambda = awsCli('lambda')
    const computeAccountArn = computeArn(region)(accountId)

    await grantInvokePermissionToRoutes(lambda, computeAccountArn, apiId, stages, specifiedRoutes)
})()