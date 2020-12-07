import {chainOption, concatOptions, mapOption, maybeUndefined, safeProperty} from 'data-structures'
import {capitalize, joinWithComma, joinWithEqualitySign, joinWithSpace, map} from 'standard-functions'
import {executeCommand} from '../../execution'
import {computeLambdaFunctionArn} from '../../arns'

function computeEquality(key) {
    return value => joinWithEqualitySign([key, value])
}

function computePasswordSetting([key, value]) {
    const maybeValue = maybeUndefined(value)

    return mapOption(computeEquality(key)) (maybeValue)
}

function computeNameConfiguration(name) {
    return ['pool-name', name]
}

function computePasswordConfiguration({ minimumLength, requireUppercase, requireLowercase, requireNumbers, requireSymbols }) {
    const pairs = [
        ['MinimumLength', minimumLength],
        ['RequireUppercase', requireUppercase],
        ['RequireLowercase', requireLowercase],
        ['RequireNumbers', requireNumbers],
        ['RequireSymbols', requireSymbols]
    ]

    const optionalSettings = map(computePasswordSetting) (pairs)

    const presentSettings = concatOptions(optionalSettings)

    return ['policies', `PasswordPolicy={${joinWithComma(presentSettings)}}`]
}

function computeVerifyEmailConfiguration(verifyEmail) {
    return verifyEmail ? [ 'auto-verified-attributes', 'email' ] : []
}

function computeLambdaConfiguration(computeAccountArn) {
    const computeArnForAccount = computeLambdaFunctionArn(computeAccountArn)

    function computeTriggerSetting(trigger) {
        return functionName => joinWithEqualitySign(trigger, computeArnForAccount(functionName))
    }

    function computeOptionalTriggerSetting([trigger, functionName]) {
        const maybeFunctionName = maybeUndefined(functionName)

        return mapOption(computeTriggerSetting(trigger)) (maybeFunctionName)
    }

    return ({ preSignUp, customMessage }) => {
        const optionalTriggers = [
            ['PreSignUp', preSignUp],
            ['CustomMessage', customMessage]
        ]

        const optionalTriggerSettings = map(computeOptionalTriggerSetting) (optionalTriggers)

        const settings = concatOptions(optionalTriggerSettings)

        return ['lambda-config', joinWithComma(settings) ]
    }
}

function computeAttribute({ name, type, mutable, required }) {
    const pairs = [
        ['Name', name],
        ['AttributeDataType', capitalize(type)],
        ['DeveloperOnlyAttribute', false],
        ['Mutable', mutable],
        ['Required', required]
    ]

    const settings = map(joinWithEqualitySign)(pairs)

    return joinWithComma(settings)
}

function computeSchema(schema) {
    const attributes = map(computeAttribute) (schema)

    const list = joinWithSpace(attributes)

    return ['schema', list]
}

function computeUsernameConfiguration(isCaseSensitive) {
    return ['username-configuration', computeEquality('CaseSensitive') (isCaseSensitive) ]
}

function computeUsernameAttributes(attributes) {
    return ['username-attributes', joinWithSpace(attributes) ]
}

export default function createUserPool(cognitoIdp, computeAccountArn, { name, passwords, verifyEmail, lambda, schema, username }) {
    const nameConfiguration = computeNameConfiguration(name)

    const maybePasswords = maybeUndefined(passwords)
    const maybePasswordConfiguration = mapOption(computePasswordConfiguration) (maybePasswords)

    const maybeVerifyEmail = maybeUndefined(verifyEmail)
    const maybeVerifyEmailConfiguration = mapOption(computeVerifyEmailConfiguration) (maybeVerifyEmail)

    const maybeLambda = maybeUndefined(lambda)
    const maybeLambdaConfiguration = mapOption(computeLambdaConfiguration(computeAccountArn)) (maybeLambda)

    const maybeSchema = maybeUndefined(schema)
    const maybeSchemaConfiguration = mapOption(computeSchema) (maybeSchema)

    const maybeUsername = maybeUndefined(username)

    const maybeCaseSensitive = chainOption(safeProperty('isCaseSensitive'))(maybeUsername)
    const maybeUsernameCaseSensitivityConfiguration = mapOption(computeUsernameConfiguration) (maybeCaseSensitive)

    const maybeUsernameAttributes = chainOption(safeProperty('attributes'))(maybeUsername)
    const maybeUsernameAttributesConfigurations = mapOption(computeUsernameAttributes) (maybeUsernameAttributes)

    const configuration = concatOptions([
        maybePasswordConfiguration,
        maybeVerifyEmailConfiguration,
        maybeLambdaConfiguration,
        maybeSchemaConfiguration,
        maybeUsernameCaseSensitivityConfiguration,
        maybeUsernameAttributesConfigurations
    ])

    const parameters = [nameConfiguration].concat(configuration)

    const command = cognitoIdp('create-user-pool') (parameters)

    console.log(command)

    return executeCommand(command).then(JSON.parse)
}