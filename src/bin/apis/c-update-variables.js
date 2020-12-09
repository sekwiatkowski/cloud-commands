#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {parseApiStages} from '../../cli-arguments'
import {findApiIdByName} from '../../additional-information/api-id'
import updateStageVariables from '../../actions/apis/update-stage-variables'
import {asyncMap, entries, map, property, unzip} from 'standard-functions'
import combineApiAndStageName from '../../api-name'

(async () => {
    const { api, profile, region } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, stages } = api

    const selectedStages = parseApiStages(stages)

    const [stageKeys, configurations] = unzip(entries(selectedStages))

    const stageNames = map(property('name')) (configurations)
    const variables = map(property('variables')) (configurations)

    const combinedNames = map(combineApiAndStageName(name)) (stageNames)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const apiIds = await asyncMap(combinedName =>
        findApiIdByName(apiGatewayV2, combinedName)
    )(combinedNames)

    await updateStageVariables(apiGatewayV2, stageKeys, stageNames, apiIds, variables)
})()