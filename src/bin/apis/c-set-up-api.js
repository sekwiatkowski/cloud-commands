#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {createApi} from '../../actions/apis/create-api'
import {computeArn} from '../../arns'
import {entries, map, property, unique, unzip, values, zipObject} from 'standard-functions'
import integrateFunctions from '../../actions/apis/integrate-function'
import createApiRoutes from '../../actions/apis/create-api-route'
import {createApiStages} from '../../actions/apis/create-api-stage'
import grantInvokePermissionToRoutes from '../../actions/apis/grant-invoke-permission-to-routes'
import createApiAuthorizers from '../../actions/apis/create-api-authorizer'
import {foldOption, maybeUndefined} from 'data-structures'

(async () => {
    const { profile, accountId, region, api } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const stageEntries = entries(api.stages)

    const [stageKeys, stages] = unzip(stageEntries)
    const stageNames = map(property('name')) (stages)

    const awsCli = createAwsCli(profile, region)

    const apiGatewayV2 = awsCli('apigatewayv2')
    const lambda = awsCli('lambda')
    const cognitoIdp = awsCli('cognito-idp')

    const computeAccountArn = computeArn(region)(accountId)

    // Create API
    const createdApis = await createApi(apiGatewayV2, api)
    const apiIds = map(property('ApiId')) (createdApis)

    // Create authorizers
    const maybeAuthorization = maybeUndefined(api.authorization)
    const authorizerIds = await foldOption
        (authorization =>
            createApiAuthorizers(cognitoIdp, apiGatewayV2, region, authorization, stageNames, stageKeys, apiIds)
                .then(map(property('AuthorizerId'))))
        (null)
        (maybeAuthorization)

    // Integrate functions
    const functionNames = unique(values(api.routes))
    const integratedFunctions = await integrateFunctions(apiGatewayV2, computeAccountArn, stageNames, apiIds, functionNames)
    const integrationIds = map(map(property('IntegrationId')))(integratedFunctions)
    const integrations = map(zipObject(functionNames))(integrationIds)

    // Create routes
    await createApiRoutes(apiGatewayV2, stageNames, apiIds, authorizerIds, integrations, api.routes)

    // Create stages
    await createApiStages(apiGatewayV2, stageKeys, stages, apiIds)

    // Grant invoke permissions to routes
    await grantInvokePermissionToRoutes(lambda, computeAccountArn, stageKeys, apiIds, api.routes)

})()