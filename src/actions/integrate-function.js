import {executeCommand} from '../execution'

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
    return (apiName, apiId) => functionName => {
        console.log(`Integrating function "${functionName}" with API "${apiName}" ...`)

        const functionArn = computeArn('lambda')('function' + ':' + functionName)

        const [subcommand, options] = computeIntegrateFunctionParameters(apiId)(functionArn)

        const command = apiGatewayV2(subcommand) (options)

        console.log(command)

        return executeCommand(command)
    }
}