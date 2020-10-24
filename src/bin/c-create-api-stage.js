#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import {findApiIdByName} from '../additional-information/api-id'
import {createAwsCli} from '../aws-cli'
import {createApiStages} from '../actions/create-api-stage'
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

    const id = await findApiIdByName(apiGatewayV2, name)

    await createApiStages(apiGatewayV2, id, specifiedStages)
})()