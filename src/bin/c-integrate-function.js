#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import {createAwsCli} from '../aws-cli'
import {parseApiFunctionNames} from '../cli-arguments'
import {integrateFunctions} from '../actions/integrate-function'
import computeArn from '../arns'
import {findApiIdByName} from '../additional-information/api-id'

(async () => {
    const { api, profile, region, accountId } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, routes } = api

    const functionNames = parseApiFunctionNames(routes)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const computeAccountArn = computeArn(region)(accountId)

    const id = await findApiIdByName(apiGatewayV2, name)

    await integrateFunctions(apiGatewayV2, computeAccountArn, id, functionNames)
})()