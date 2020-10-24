#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {fromEntries, map, mapValues, property, propertyOf, unique, values, zip} from 'compose-functions'
import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {createApi} from '../../actions/apis/create-api'
import {createApiStages} from '../../actions/apis/create-api-stage'
import {createApiRoutes} from '../../actions/apis/create-api-route'
import {integrateFunctions} from '../../actions/apis/integrate-function'
import computeArn from '../../arns'
import {grantInvokePermissions} from '../../actions/apis/grant-invoke-permission'

(async () => {
    const { profile, accountId, region, api } = await parseConfigurationFile('aws.json')
    //const functionNames = parseFunctionNames({ functions })

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, stages, routes } = api

    // Create API
    const awsCli = createAwsCli(profile, region)

    const apiGatewayV2 = awsCli('apigatewayv2')
    const lambda = awsCli('lambda')

    const computeAccountArn = computeArn(region)(accountId)

    const createdApi = await createApi(apiGatewayV2, api)

    const id = property('ApiId')(createdApi)

    const usedFunctions = unique(values(routes))
    const integratedFunctions = await integrateFunctions(apiGatewayV2, computeAccountArn, id, usedFunctions)
    const integrationIds = map(property('IntegrationId'))(integratedFunctions)
    const functionsAndIntegrationIds = fromEntries(zip(usedFunctions)(integrationIds))
    const routeKeysAndIntegrationIds = mapValues(propertyOf(functionsAndIntegrationIds))(routes)

    await createApiStages(apiGatewayV2, id, stages)

    await createApiRoutes(apiGatewayV2, id, routeKeysAndIntegrationIds)

    await grantInvokePermissions(apiGatewayV2, lambda, computeAccountArn, id, stages, routes)
})()