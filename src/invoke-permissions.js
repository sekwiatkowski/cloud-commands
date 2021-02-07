import {executeCommand} from './execution'

function generateRandomInteger(low, high) {
    return parseInt(Math.random() * (high - low) + low)
}

function generateRandomStatementId() {
    return generateRandomInteger(100_000_000, 999_999_999).toString()
}

function computeGrantInvokePermissionOptions(principal) {
    return (sourceArn, functionArn) =>
        [
            ['action', 'lambda:InvokeFunction'],
            ['principal', principal],
            ['source-arn', sourceArn],
            ['function-name', functionArn],
            ['statement-id', generateRandomStatementId()]
        ]
}

export default function grantInvokePermission(lambda) {
    return principal => {
        const computeOptionsForPrincipal = computeGrantInvokePermissionOptions(principal)

        return (sourceArn, functionArn) => {
            const options = computeOptionsForPrincipal(sourceArn, functionArn)

            const command = lambda('add-permission') (options)

            return executeCommand(command)
        }
    }
}