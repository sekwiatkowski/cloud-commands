import {executeCommand} from '../execution'
import {concat, find, isEmpty} from 'standard-functions'

function computeListUserPoolClientss(poolId, token) {
    const baseOptions = [
        ['user-pool-id', poolId],
        ['max-results', 20]
    ]

    const tokenOptions = token
        ? [ [ 'starting-token', token ] ]
        : []

    return concat(baseOptions, tokenOptions)
}

export function findUserPoolClientIdByName(cognitoIdp, poolId, clientName, token) {
    const options = computeListUserPoolClientss(poolId, token)
    const command = cognitoIdp('list-user-pool-clients') (options)

    console.log(command)

    return executeCommand(command)
        .then(JSON.parse)
        .then(res => {
            if (isEmpty(res)) {
                return null
            }

            const {UserPoolClients, NextToken} = res
            const found = find(item => item.ClientName === clientName) (UserPoolClients)

            if (found) {
                return found.ClientId
            }
            else if(NextToken) {
                return findUserPoolClientIdByName(cognitoIdp, poolId, clientName, NextToken)
            }
            else {
                return null
            }
        })
}
