#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {fromEntries, map, mapValues, property, propertyOf, unique, values, zip} from 'standard-functions'
import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {createApi} from '../../actions/apis/create-api'
import {createApiStages} from '../../actions/apis/create-api-stage'
import {createApiRoutes} from '../../actions/apis/create-api-route'
import {integrateFunctions} from '../../actions/apis/integrate-function'
import {computeArn} from '../../arns'
import grantInvokePermissionToRoutes from '../../actions/apis/grant-invoke-permission-to-routes'

(async () => {
    const { profile, accountId, region, api } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { stages, routes } = api

    const awsCli = createAwsCli(profile, region)

    const apiGatewayV2 = awsCli('apigatewayv2')
    const lambda = awsCli('lambda')

    const computeAccountArn = computeArn(region)(accountId)

    // Create API
    const createdApi = await createApi(apiGatewayV2, api)

    const apiId = createdApi.ApiId

    const usedFunctions = unique(values(routes))
    // Integrate functions
    const integratedFunctions = await integrateFunctions(apiGatewayV2, computeAccountArn, apiId, usedFunctions)
    const integrationIds = map(property('IntegrationId'))(integratedFunctions)
    const functionsAndIntegrationIds = fromEntries(zip(usedFunctions)(integrationIds))
    const routeKeysAndIntegrationIds = mapValues(propertyOf(functionsAndIntegrationIds))(routes)

    // Create stages
    await createApiStages(apiGatewayV2, apiId, stages)

    // Create routes
    await createApiRoutes(apiGatewayV2, apiId, routeKeysAndIntegrationIds)

    // Grant invoke permissions to routes
    await grantInvokePermissionToRoutes(lambda, computeAccountArn, apiId, stages, routes)
})()