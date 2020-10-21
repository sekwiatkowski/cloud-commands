import {executeCommand} from '../execution'

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
    return (apiName, apiId) => {
        return stage => {
            return ([verb, path], functionName) => {
                console.log(`Granting invoke permission for function "${functionName}" to route "${verb} ${path}" of the "${stage}" stage of the "${apiName}" API ...`)

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