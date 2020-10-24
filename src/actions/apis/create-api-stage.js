import {executeCommand} from '../../execution'
import {performSequentially} from '../../perform-sequentially'
import {map} from 'compose-functions'

function computeCreateStageOptions(apiId) {
    return stage =>
        [
            ['api-id', apiId],
            ['stage-name', stage],
            'auto-deploy'
        ]
}

export function createApiStage(apiGatewayV2, id) {
    return stage => {
        console.log(`Creating stage "${stage}" ...`)

        const options = computeCreateStageOptions(id)(stage)

        const command = apiGatewayV2('create-stage')(options)

        console.log(command)

        return executeCommand(command)
    }
}

export async function createApiStages(apiGatewayV2, id, stages) {
    const actions = map(stage => () => createApiStage(apiGatewayV2, id) (stage))(stages)

    return performSequentially(actions)
}