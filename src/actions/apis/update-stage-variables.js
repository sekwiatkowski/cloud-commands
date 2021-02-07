import {map, zip} from 'standard-functions'
import {performSequentially} from '../../perform-sequentially'
import {executeCommand} from '../../execution'
import serializeStageVariables from '../../stage-variables'


function updateVariablesInStage(apiGatewayV2, stageKey, stageName, apiId, stageVariables) {
    console.log(`Processing "${stageName}" stage ...`)

    const options = [
        ['api-id', apiId],
        ['stage-name', stageKey],
        ['stage-variables', serializeStageVariables(stageVariables)]
    ]

    const command = apiGatewayV2('update-stage')(options)

    return executeCommand(command).then(JSON.parse)
}

export default async function updateStageVariables(apiGatewayV2, stageKeys, stagesNames, apiIds, variables) {
    console.log('Updating stage variables ...')

    const actions = map(([key, name, apiId, variables]) => () =>

        updateVariablesInStage(apiGatewayV2, key, name, apiId, variables)

    ) (zip(stageKeys, stagesNames, apiIds, variables))

    return performSequentially(actions)
}