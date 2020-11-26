#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {parseApiStages} from '../../cli-arguments'
import {findApiIdByName} from '../../additional-information/api-id'
import updateVariablesInStages from '../../actions/apis/update-variables'

(async () => {
    const { api, profile, region } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, stages } = api

    const selectedStages = parseApiStages(stages)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const apiId = await findApiIdByName(apiGatewayV2, name)

    await updateVariablesInStages(apiGatewayV2, apiId, selectedStages)
})()