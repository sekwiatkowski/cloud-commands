#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseApiRoutes} from '../cli-arguments'
import {parseConfigurationFile} from '../configuration'
import {createAwsCli} from '../aws-cli'
import computeArn from '../arns'
import {entries} from 'compose-functions'
import {grantInvokePermissions} from '../actions/grant-invoke-permission'
import {findApiIdByName} from '../additional-information/api-id'

(async () => {
    const { profile, region, api, accountId } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, stages, routes } = api

    const specifiedRoutes = entries(parseApiRoutes(routes))

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')
    const lambda = awsCli('lambda')

    const computeAccountArn = computeArn(region) (accountId)

    const id = await findApiIdByName(apiGatewayV2, name)

    await grantInvokePermissions(apiGatewayV2, lambda, computeAccountArn, id, stages, specifiedRoutes)
})()