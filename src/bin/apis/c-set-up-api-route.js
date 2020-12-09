#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {parseApiRoutes} from '../../cli-arguments'
import {asyncMap, keys, map, property, unique, values} from 'standard-functions'
import createApiRoutes from '../../actions/apis/create-api-route'
import combineApiAndStageName from '../../api-name'
import {findApiIdByName} from '../../additional-information/api-id'
import {findIntegrationIdsByNames} from '../../additional-information/integration-id'
import grantInvokePermissionToRoutes from '../../actions/apis/grant-invoke-permission-to-routes'
import {computeArn} from '../../arns'
import {getAuthorizerIdByApiId} from '../../additional-information/authorizer-id'


(async () => {
    const { profile, accountId, region, api } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { authorization, routes, stages, name } = api

    const selectedRoutes = parseApiRoutes(routes)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')
    const lambda = awsCli('lambda')

    const computeAccountArn = computeArn(region) (accountId)

    const stageNames = map(property('name')) (values(stages))
    const combinedNames = map(combineApiAndStageName(name)) (stageNames)

    const apiIds = await asyncMap(combinedName =>
        findApiIdByName(apiGatewayV2, combinedName)
    )(combinedNames)

    const authorizerIds = await (authorization
        ? asyncMap(getAuthorizerIdByApiId(apiGatewayV2)) (apiIds)
        : null)

    const usedFunctions = unique(values(selectedRoutes))
    const integrationIds = await asyncMap(apiId =>
        findIntegrationIdsByNames(apiGatewayV2, apiId, usedFunctions)
    )(apiIds)

    await createApiRoutes(apiGatewayV2, stageNames, apiIds, authorizerIds, integrationIds, selectedRoutes)

    await grantInvokePermissionToRoutes(lambda, computeAccountArn, keys(stages), apiIds, selectedRoutes)

})()