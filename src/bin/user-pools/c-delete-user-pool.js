#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {findUserPoolIdByName} from '../../additional-information/user-pool-id'
import deleteUserPool from '../../actions/user-pools/delete-user-pool'

(async () => {
    const { profile, region, userPool } = await parseConfigurationFile('aws.json')

    if (!userPool) {
        console.error('No user pool has been configured.')
        process.exit(1)
    }

    const awsCli = createAwsCli(profile, region)
    const cognitoIdp = awsCli('cognito-idp')

    const { name } = userPool

    const id = await findUserPoolIdByName(cognitoIdp, name)

    if (!id) {
        console.error('The user pool does not exist.')
        process.exit(1)
    }

    await deleteUserPool(cognitoIdp, name, id)
})()