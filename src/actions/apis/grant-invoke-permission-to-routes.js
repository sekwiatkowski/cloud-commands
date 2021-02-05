import {isString, map, mapEntries, splitBySpace, zip} from 'standard-functions'
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

export default async function grantInvokePermissionToRoutes(lambda, computeAccountArn, stageKeys, apiIds, routes) {
    console.log('Granting invoke permissions to routes ...')

    const grantToAccount = grantInvokePermissionToRoute(lambda, computeAccountArn)

    const actions = map(([stageKey, apiId]) => () => {
        const grantToStage = grantToAccount(apiId) (stageKey)

        const stageActions = mapEntries
            (([routeKey, routeConfiguration]) => () =>
                grantToStage(splitBySpace(routeKey), isString(routeConfiguration) ? routeConfiguration : routeConfiguration.function)
            )
            (routes)

        return performSequentially(stageActions)
    }) (zip(stageKeys, apiIds))

    return performSequentially(actions)
}