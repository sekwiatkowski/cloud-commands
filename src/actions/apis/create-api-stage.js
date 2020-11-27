import {executeCommand} from '../../execution'
import {performSequentially} from '../../perform-sequentially'
import {mapEntries} from 'standard-functions'
import serializeStageVariables from '../../stage-variables'

function computeCreateStageOptions(apiId) {
    return ([name, variables]) =>
        [
            ['api-id', apiId],
            ['stage-name', name],
            ['stage-variables', serializeStageVariables(variables)],
            'auto-deploy'
        ]
}

export function createApiStage(apiGatewayV2, apiId) {
    return ([name, variables]) => {
        console.log(`Creating stage "${name}" ...`)

        const options = computeCreateStageOptions(apiId)(name, variables)

        const command = apiGatewayV2('create-stage')(options)

        console.log(command)

        return executeCommand(command)
    }
}

export async function createApiStages(apiGatewayV2, apiId, stages) {
    const actions = mapEntries(([name, variables]) => () => createApiStage(apiGatewayV2, apiId)(name, variables))(stages)

    return performSequentially(actions)
}