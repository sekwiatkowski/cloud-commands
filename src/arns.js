// https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
// arn:partition:service:region:account-id:resource-id
// arn:partition:service:region:account-id:resource-type/resource-id

export function computeArn(region) {
    return accountId => service => resource => [
        'arn',
        'aws',
        service,
        region,
        accountId,
        resource
    ].join(':')
}

export function computeLambdaFunctionArn(computeAccountArn) {
    // arn:aws:lambda:[region]:[account ID]:function:[function name]
    return functionName => computeAccountArn('lambda') ('function' + ':' + functionName)
}

export function computeExecuteApiArn(computeAccountArn) {
    // arn:aws:execute-api:[region]:[account ID]:[api ID]/[stage name]/[verb]/[resource path]
    return (apiId, stage, verb, path) => computeAccountArn('execute-api') (apiId + '/' + stage + '/' + verb + path)
}

export function computeUserPoolArn(computeAccountArn) {
//  arn:aws:cognito-idp:[region]:[account ID]:userpool/[pool id]
    return poolId => computeAccountArn('cognito-idp') ('userpool' + '/' + poolId)
}