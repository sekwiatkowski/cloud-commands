import {executeCommand} from '../execution'

function computeDeleteApiOptions(apiId) {
    return [
        ['api-id', apiId]
    ]
}

export function deleteApi(apiGatewayV2, name, id) {
    console.log(`Deleting API ${name} ...`)

    const options = computeDeleteApiOptions(id)

    const command = apiGatewayV2('delete-api') (options)

    console.log(command)

    return executeCommand(command)
}
