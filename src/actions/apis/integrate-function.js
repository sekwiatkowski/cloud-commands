import {executeCommand} from '../../execution'
import {map, zip} from 'standard-functions'
import {performSequentially} from '../../perform-sequentially'
import {computeLambdaFunctionArn} from '../../arns'

function computeIntegrateFunctionParameters(apiId) {
    return lambdaArn => [
        'create-integration',
        [
            ['api-id', apiId],
            ['integration-type', 'AWS_PROXY'],
            ['integration-uri', lambdaArn],
            ['payload-format-version', '2.0']
        ]
    ]
}

function integrateFunction(apiGatewayV2, computeArn) {
    return apiId => functionName => {
        console.log(`Integrating function "${functionName}" ...`)

        const functionArn = computeLambdaFunctionArn(computeArn) (functionName)

        const [subcommand, options] = computeIntegrateFunctionParameters(apiId)(functionArn)

        const command = apiGatewayV2(subcommand) (options)

        return executeCommand(command).then(JSON.parse)
    }
}

export default async function integrateFunctions(apiGatewayV2, computeAccountArn, stageNames, apiIds, functionNames) {
    console.log('Integrating functions ....')

    const integrateWithAccount = integrateFunction(apiGatewayV2, computeAccountArn)

    const actions = map(([ stageName, apiId ]) => () => {
        console.log(`Processing stage "${stageName}" ...`)

        const integrateWithApi = integrateWithAccount(apiId)

        const stageActions = map(functionName => () => integrateWithApi(functionName)) (functionNames)

        return performSequentially(stageActions)

    }) (zip(stageNames, apiIds))

    return performSequentially(actions)
}