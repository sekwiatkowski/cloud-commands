#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseApiRouteKeys} from '../cli-arguments'
import {parseConfigurationFile} from '../configuration'
import {findApiIdByName} from '../additional-information/api-id'
import {createAwsCli} from '../aws-cli'
import computeArn from '../arns'
import {grantInvokePermission} from '../actions/grant-invoke-permission'
import {entries, flatMap, map, pick, splitBySpace} from 'compose-functions'
import {performSequentially} from '../perform-sequentially'

(async () => {
    const { profile, region, api, accountId } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, routes, stages } = api

    const specifiedRouteKeys = parseApiRouteKeys(routes)

    const specifiedRoutes = entries(pick(specifiedRouteKeys)(routes))

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const id = await findApiIdByName(apiGatewayV2, name)

    const computeAccountArn = computeArn(region) (accountId)
    const lambda = awsCli('lambda')

    const grantToAccount = grantInvokePermission(computeAccountArn, lambda)
    const grantToApi = grantToAccount(name, id)

    const actions = flatMap(stage => {
        const grantToStage = grantToApi(stage)

        return map
            (([routeKey, functionName]) => () =>
                grantToStage(splitBySpace(routeKey), functionName)
            )
            (specifiedRoutes)
    })(stages)

    performSequentially(actions)
})()