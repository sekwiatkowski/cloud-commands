import {executeCommand} from '../execution'
import {flatMap, mapEntries, splitBySpace} from 'compose-functions'
import {performSequentially} from '../perform-sequentially'

function generateRandomInteger(low, high) {
    return parseInt(Math.random() * (high - low) + low)
}

function generateRandomStatementId() {
    return generateRandomInteger(100_000_000, 999_999_999).toString()
}

export function computeGrantInvokePermissionOptions(functionArn, sourceArn) {
    return [
        ['action', 'lambda:InvokeFunction'],
        ['principal', 'apigateway.amazonaws.com'],
        ['source-arn', sourceArn],
        ['function-name', functionArn],
        ['statement-id', generateRandomStatementId()]
    ]
}

export function grantInvokePermission(computeAccountArn, lambda) {
    return apiId => {
        return stage => {
            return ([verb, path], functionName) => {
                console.log(`Granting invoke permission for function "${functionName}" to route "${verb} ${path}" of the "${stage}" stage ...`)

                // arn:aws:lambda:[region]:[account ID]:function:[function name]
                const functionArn = computeAccountArn('lambda')('function' + ':' + functionName)

                // arn:aws:execute-api:[region]:[account ID]:[api ID]/[stage name]/[verb]/[resource path]
                const sourceArn = computeAccountArn('execute-api')(apiId + '/' + stage + '/' + verb + path)

                const options = computeGrantInvokePermissionOptions (functionArn, sourceArn)

                const command = lambda('add-permission') (options)

                return executeCommand(command)
            }
        }
    }
}

export async function grantInvokePermissions(apiGatewayV2, lambda, computeAccountArn, id, stages, routes) {
    const grantToAccount = grantInvokePermission(computeAccountArn, lambda)
    const grantToApi = grantToAccount(id)

    const actions = flatMap(stage => {
        const grantToStage = grantToApi(stage)

        return mapEntries
            (([routeKey, functionName]) => () =>
                grantToStage(splitBySpace(routeKey), functionName)
            )
            (routes)
    }) (stages)

    return performSequentially(actions)
}