import {computeLambdaFunctionArn, computeUserPoolArn} from '../../arns'
import grantInvokePermission from '../../invoke-permissions'
import {performSequentially} from '../../perform-sequentially'
import {map} from 'standard-functions'

function grantInvokePermissionToUserPoolFunction(lambda, computeAccountArn) {
    return userPoolId => {
        return functionName => {
            console.log(`Granting invoke permission for function "${functionName}" to userPool "${userPoolId}" ...`)

            const functionArn = computeLambdaFunctionArn(computeAccountArn) (functionName)
            const sourceArn = computeUserPoolArn(computeAccountArn) (userPoolId)

            return () => grantInvokePermission(lambda) ('cognito-idp.amazonaws.com') (sourceArn, functionArn)
        }
    }
}

export default async function grantInvokePermissionToUserPoolFunctions(lambda, computeAccountArn, userPoolId, functionNames) {
    const grantToFunction = grantInvokePermissionToUserPoolFunction(lambda, computeAccountArn)(userPoolId)

    const actions = map(grantToFunction) (functionNames)

    return performSequentially(actions)
}