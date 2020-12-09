import {executeCommand} from '../execution'
import {single} from 'standard-functions'

function computeGetAuthorizersOptions(apiId) {
    return [
        ['api-id', apiId]
    ]
}

export function getAuthorizerIdByApiId(apiGatewayV2) {
    return apiId => {
        const options = computeGetAuthorizersOptions(apiId)

        const command = apiGatewayV2('get-authorizers')(options)

        return executeCommand(command)
            .then(JSON.parse)
            .then(({Items}) => single(Items).AuthorizerId)
    }
}