import {mapEntries} from 'standard-functions'
import {performSequentially} from '../../perform-sequentially'
import {executeCommand} from '../../execution'
import serializeStageVariables from '../../stage-variables'


function updateVariablesInStage(apiGatewayV2, apiId, stageName, stageVariables) {
    console.log(`Updating variables in stage "${stageName}" ...`)

    const options = [
        ['api-id', apiId],
        ['stage-name', stageName],
        ['stage-variables', serializeStageVariables(stageVariables)]
    ]

    const command = apiGatewayV2('update-stage')(options)

    console.log(command)

    return executeCommand(command).then(JSON.parse)
}

export default async function updateVariablesInStages(apiGatewayV2, apiId, stages) {
    const actions = mapEntries(([name, variables]) => () => updateVariablesInStage(apiGatewayV2, apiId, name, variables))(stages)

    return performSequentially(actions)
}