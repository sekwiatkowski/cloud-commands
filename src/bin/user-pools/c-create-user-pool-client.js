#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import createUserPoolClient from '../../actions/user-pools/create-user-pool-client'
import {parseUserPoolClients} from '../../cli-arguments'
import {entries, map} from 'standard-functions'
import {performSequentially} from '../../perform-sequentially'

(async () => {
    const {profile, region, userPool } = await parseConfigurationFile('aws.json')

    if (!userPool) {
        console.error('No user pool has been configured.')
        process.exit(1)
    }

    const { clients } = userPool

    if (!clients) {
        console.error('No user pool client has been configured.')
        process.exit(1)
    }

    const selectedClients = parseUserPoolClients(clients)

    const awsCli = createAwsCli(profile, region)
    const cognitoIdp = awsCli('cognito-idp')

    const actions = map
        (([clientName, clientOptions]) => () => createUserPoolClient(cognitoIdp, userPool.name, clientName, clientOptions))
        (entries(selectedClients))

    await performSequentially(actions)
})()