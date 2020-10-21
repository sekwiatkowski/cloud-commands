#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import {findApiIdByName} from '../additional-information/api-id'
import {createAwsCli} from '../aws-cli'
import {map} from 'compose-functions'
import createApiStage from '../actions/create-api-stage'
import {performSequentially} from '../perform-sequentially'
import {parseApiStages} from '../cli-arguments'

(async () => {
    const { api, profile, region } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, stages } = api

    const specifiedStages = parseApiStages(stages)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const apiId = await findApiIdByName(apiGatewayV2, name)

    const createStageOfApi = createApiStage(apiGatewayV2, apiId)

    const actions = map(stage => () => createStageOfApi(stage))(specifiedStages)

    performSequentially(actions)
})()