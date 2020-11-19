import {executeCommand} from '../../execution'
import {map} from 'standard-functions'
import {performSequentially} from '../../perform-sequentially'

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

export function integrateFunction(apiGatewayV2, computeArn) {
    return apiId => functionName => {
        console.log(`Integrating function "${functionName}" ...`)

        const functionArn = computeArn('lambda')('function' + ':' + functionName)

        const [subcommand, options] = computeIntegrateFunctionParameters(apiId)(functionArn)

        const command = apiGatewayV2(subcommand) (options)

        console.log(command)

        return executeCommand(command).then(JSON.parse)
    }
}

export function integrateFunctions(apiGatewayV2, computeAccountArn, id, functionNames) {
    const integrateWithApi = integrateFunction(apiGatewayV2, computeAccountArn)(id)

    const actions = map(name => () => integrateWithApi(name))(functionNames)

    return performSequentially(actions)
}