#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {parseApiFunctionNames} from '../../cli-arguments'
import {findApiIdByName} from '../../additional-information/api-id'
import {computeArn} from '../../arns'
import {parallelMap, map, property, values} from 'standard-functions'
import combineApiAndStageName from '../../api-name'
import integrateFunctions from '../../actions/apis/integrate-function'

(async () => {
    const { api, profile, region, accountId } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const functionNames = parseApiFunctionNames(api.routes)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const computeAccountArn = computeArn(region) (accountId)

    const stageNames = map(property('name')) (values(api.stages))

    const combinedNames = map(combineApiAndStageName(api.name)) (stageNames)

    const apiIds = await parallelMap(combinedName =>
        findApiIdByName(apiGatewayV2, combinedName)
    )(combinedNames)

    await integrateFunctions(apiGatewayV2, computeAccountArn, stageNames, apiIds, functionNames)
})()