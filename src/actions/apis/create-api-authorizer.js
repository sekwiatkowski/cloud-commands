import {executeCommand} from '../../execution'
import {joinWithComma, joinWithDash, map, parallelMap, zip} from 'standard-functions'
import {performSequentially} from '../../perform-sequentially'
import {findUserPoolIdByName} from '../../additional-information/user-pool-id'
import {findUserPoolClientIdByName} from '../../additional-information/user-pool-client-id'

function computeIssuer(region, poolId) {
    return `https://cognito-idp.${region}.amazonaws.com/${poolId}`
}

function computeCreateAuthorizerOptions(region, name, apiId, poolId, clientIds) {
    const audienceList = joinWithComma(clientIds)
    const issuer = computeIssuer(region, poolId)

    const options = [
        ['name', name],
        ['api-id', apiId],
        ['authorizer-type', 'JWT'],
        ['identity-source', '$request.header.Authorization'],
        ['jwt-configuration', `Audience=${audienceList}),Issuer=${issuer}`]
    ]

    return options
}

async function createApiAuthorizer(cognitoIdp, apiGatewayV2, region, authorization, stageName, stageKey, apiId) {
    console.log(`Creating authorizer for the "${stageName}" stage ...`)

    const poolName = joinWithDash(/*stageKey, */authorization.userPool)
    const poolId = await findUserPoolIdByName(cognitoIdp, poolName)

    const clientNames = map(name => joinWithDash(/*stageKey, */name))(authorization.clients)
    const clientIds = await parallelMap(name => findUserPoolClientIdByName(cognitoIdp, poolId, name)) (clientNames)

    const authorizerName = joinWithDash(stageKey, authorization.authorizer)

    const options = computeCreateAuthorizerOptions(region, authorizerName, apiId, poolId, clientIds)

    const command = apiGatewayV2('create-authorizer') (options)
    console.log(command)

    return executeCommand(command).then(JSON.parse)
}

export default function createApiAuthorizers(cognitoIdp, apiGatewayV2, region, authorization, stageNames, stageKeys, apiIds) {
    console.log('Creating authorizers ...')

    const actions = map(([ stageKey, stageName, apiId ]) => () =>
        createApiAuthorizer(cognitoIdp, apiGatewayV2, region, authorization, stageName, stageKey, apiId)
    ) (zip(stageKeys, stageNames, apiIds))

    return performSequentially(actions)
}