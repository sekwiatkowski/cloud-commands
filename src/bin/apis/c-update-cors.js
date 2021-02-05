#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {parseApiStages} from '../../cli-arguments'
import {findApiIdByName} from '../../additional-information/api-id'
import {entries, map, parallelMap, property, unzip} from 'standard-functions'
import combineApiAndStageName from '../../api-name'
import updateCorsConfiguration from '../../actions/apis/update-cors-configuration'

(async () => {
    const { api, profile, region } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name, stages, cors, routes } = api

    const selectedStages = parseApiStages(stages)

    const [stageKeys, stageConfigurations] = unzip(entries(selectedStages))

    const stageNames = map(property('name')) (stageConfigurations)
    const stageCors = map(property('cors')) (stageConfigurations)

    const combinedNames = map(combineApiAndStageName(name)) (stageNames)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const apiIds = await parallelMap(combinedName =>
        findApiIdByName(apiGatewayV2, combinedName)
    )(combinedNames)

    await updateCorsConfiguration(apiGatewayV2, stageKeys, stageNames, apiIds, cors, stageCors, routes)
})()