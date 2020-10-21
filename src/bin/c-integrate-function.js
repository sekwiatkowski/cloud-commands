#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import {createAwsCli} from '../aws-cli'
import {findApiIdByName} from '../additional-information/api-id'
import {parseApiFunctionNames} from '../cli-arguments'
import {integrateFunction} from '../actions/integrate-function'
import computeArn from '../arns'
import {map} from 'compose-functions'
import {performSequentially} from '../perform-sequentially'

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

    const apiId = await findApiIdByName(apiGatewayV2, name)

    const computeAccountArn = computeArn(region)(accountId)

    const integrateWithApi = integrateFunction(apiGatewayV2, computeAccountArn)(name, apiId)

    const actions = map(name => () => integrateWithApi(name))(functionNames)

    performSequentially(actions)
})()