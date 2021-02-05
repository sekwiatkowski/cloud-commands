import {map, merge, zip} from 'standard-functions'
import {performSequentially} from '../../perform-sequentially'
import {executeCommand} from '../../execution'
import computeCorsOptions from '../../cors'


function updateCorsConfigurationInStage(apiGatewayV2, stageKey, stageName, apiId, cors, routes) {
    console.log(`Processing "${stageName}" stage ...`)

    const options = [
        ['api-id', apiId],
        ...computeCorsOptions(cors, routes)
    ]

    const command = apiGatewayV2('update-api') (options)

    console.log(command)

    return executeCommand(command).then(JSON.parse)
}

export default async function updateCorsConfiguration(apiGatewayV2, stageKeys, stagesNames, apiIds, corsConfiguration, stageCorsConfigurations, routes) {
    console.log('Updating CORS configuration ...')

    const actions = map(([key, name, apiId, stageCorsConfiguration]) => () =>

        updateCorsConfigurationInStage(apiGatewayV2, key, name, apiId, merge(corsConfiguration, stageCorsConfiguration), routes)

    ) (zip(stageKeys, stagesNames, apiIds, stageCorsConfigurations))

    return performSequentially(actions)
}