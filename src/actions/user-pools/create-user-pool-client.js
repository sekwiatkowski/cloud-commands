import {concatOptions, mapOption, maybeUndefined} from 'data-structures'
import {findUserPoolIdByName} from '../../additional-information/user-pool-id'
import {concat, joinWithComma, joinWithEqualitySign, joinWithSpace, map, pairWith} from 'standard-functions'
import {executeCommand} from '../../execution'

function computeFlowConfiguration() {
    const list = [ 'ALLOW_USER_PASSWORD_AUTH' , 'ALLOW_REFRESH_TOKEN_AUTH' ]

    return ['explicit-auth-flows', joinWithSpace(list) ]
}

function computeSecretConfiguration(generate) {
    return generate ? 'generate-secret' : 'no-generate-secret'
}

const tokenTypes = ['AccessToken', 'IdToken', 'RefreshToken']

function computeTokenValidityUnitConfiguration(unit) {
    const pairs = map(pairWith(unit)) (tokenTypes)

    const settings = map(joinWithEqualitySign) (pairs)

    return [ 'token-validity-units', joinWithComma(settings) ]
}

function computeTokenValidityConfiguration(token) {
    return validities => [ `${token}-token-validity`, validities[token] ]
}

export default async function createUserPoolClient(cognitoIdp, userPoolName, clientName, clientOptions) {
    const userPoolId = await findUserPoolIdByName(cognitoIdp, userPoolName)

    const requiredConfiguration = [
        [ 'user-pool-id', userPoolId ],
        [ 'client-name', clientName ],
        computeFlowConfiguration()
    ]

    const { generateSecret, tokenValidityUnit, tokenValidity } = clientOptions

    const maybeGenerateSecret = maybeUndefined(generateSecret)
    const maybeGenerateSecretConfiguration = mapOption(computeSecretConfiguration) (maybeGenerateSecret)

    const maybeTokenValidityUnit = maybeUndefined(tokenValidityUnit)
    const maybeTokenValidityUnityConfiguration = mapOption(computeTokenValidityUnitConfiguration) (maybeTokenValidityUnit)

    const maybeTokenValidity = maybeUndefined(tokenValidity)
    const maybeAccessTokenValidityConfiguration = mapOption(computeTokenValidityConfiguration('access')) (maybeTokenValidity)
    const maybeIdTokenValidityConfiguration = mapOption(computeTokenValidityConfiguration('id')) (maybeTokenValidity)
    const maybeRefreshTokenValidityConfiguration = mapOption(computeTokenValidityConfiguration('refresh')) (maybeTokenValidity)

    const optionalConfiguration = concatOptions([
        maybeGenerateSecretConfiguration,
        maybeTokenValidityUnityConfiguration,
        maybeAccessTokenValidityConfiguration,
        maybeIdTokenValidityConfiguration,
        maybeRefreshTokenValidityConfiguration
    ])

    const configuration = concat(requiredConfiguration, optionalConfiguration)

    const command = cognitoIdp('create-user-pool-client') (configuration)

    return executeCommand(command).then(JSON.parse)
}