import {executeCommand} from '../execution'

function computeCreateStageOptions(apiId) {
    return stage =>
        [
            ['api-id', apiId],
            ['stage-name', stage],
            'auto-deploy'
        ]
}

export default function createApiStage(apiGatewayV2, id) {
    return stage => {
        console.log(`Creating stage "${stage}" ...`)

        const options = computeCreateStageOptions(id)(stage)

        const command = apiGatewayV2('create-stage')(options)

        console.log(command)

        return executeCommand(command)
    }
}