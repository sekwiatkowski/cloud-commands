import {executeCommand} from '../../execution'
import {performSequentially} from '../../perform-sequentially'
import {map, zip} from 'standard-functions'
import serializeStageVariables from '../../stage-variables'

function computeCreateStageOptions(apiId) {
    return (key, variables) =>
        [
            ['api-id', apiId],
            ['stage-name', key],
            ['stage-variables', serializeStageVariables(variables)],
            'auto-deploy'
        ]
}

export function createApiStage(apiGatewayV2, apiId) {
    return (key, name, variables) => {
        console.log(`Creating the "${name}" stage ...`)

        const options = computeCreateStageOptions(apiId) (key, variables)

        const command = apiGatewayV2('create-stage')(options)

        console.log(command)

        return executeCommand(command).then(JSON.parse)
    }
}

export async function createApiStages(apiGatewayV2, stageKeys, stages, apiIds) {
    console.log('Creating API stages ...')

    const actions = map(([ key, stage, apiId ]) => () =>
        createApiStage(apiGatewayV2, apiId)(key, stage.name, stage.variables)
    ) (zip(stageKeys, stages, apiIds))

    return performSequentially(actions)
}