import {flatMap, mapEntries, splitBySpace} from 'standard-functions'
import {performSequentially} from '../../perform-sequentially'
import {computeExecuteApiArn, computeLambdaFunctionArn} from '../../arns'
import grantInvokePermission from '../../invoke-permissions'

function grantInvokePermissionToRoute(lambda, computeAccountArn) {
    return apiId => {
        return stage => {
            return ([verb, path], functionName) => {
                console.log(`Granting invoke permission for function "${functionName}" to route "${verb} ${path}" of the "${stage}" stage ...`)

                const functionArn = computeLambdaFunctionArn(computeAccountArn) (functionName)
                const sourceArn = computeExecuteApiArn(computeAccountArn) (apiId, stage, verb, path)

                return grantInvokePermission (lambda) ('apigateway.amazonaws.com') (sourceArn, functionArn)
            }
        }
    }
}

export default async function grantInvokePermissionToRoutes(lambda, computeAccountArn, apiId, stages, routes) {
    const grantToAccount = grantInvokePermissionToRoute(lambda, computeAccountArn)
    const grantToApi = grantToAccount(apiId)

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