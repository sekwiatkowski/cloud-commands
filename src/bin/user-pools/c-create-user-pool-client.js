#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import createUserPoolClient from '../../actions/user-pools/create-user-pool-client'

(async () => {
    const { accountId, profile, region, userPool } = await parseConfigurationFile('aws.json')

    if (!userPool) {
        console.error('No user pool has been configured.')
        process.exit(1)
    }

    const awsCli = createAwsCli(profile, region)
    const cognitoIdp = awsCli('cognito-idp')

    await createUserPoolClient(cognitoIdp, userPool)

})()