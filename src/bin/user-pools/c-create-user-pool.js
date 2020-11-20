#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import createUserPool from '../../actions/user-pools/create-user-pool'
import {createAwsCli} from '../../aws-cli'
import {computeArn} from '../../arns'
import grantInvokePermissionToUserPoolFunctions from '../../actions/user-pools/grant-invoke-permission-to-user-pool'
import {unique, values} from 'standard-functions'

(async () => {
    const { accountId, profile, region, userPool } = await parseConfigurationFile('aws.json')

    if (!userPool) {
        console.error('No user pool has been configured.')
        process.exit(1)
    }

    const awsCli = createAwsCli(profile, region)
    const cognitoIdp = awsCli('cognito-idp')
    const lambda = awsCli('lambda')

    const computeAccountArn = computeArn(region) (accountId)

    const { UserPool } = await createUserPool(cognitoIdp, computeAccountArn, userPool)
    const userPoolId = UserPool.Id

    const lambdaFunctions = unique(values(userPool.lambda))

    await grantInvokePermissionToUserPoolFunctions(lambda, computeAccountArn, userPoolId, lambdaFunctions)
})()