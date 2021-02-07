import {executeCommand} from '../execution'
import {concat, find, isEmpty} from 'standard-functions'

function computeListUserPools(token) {
    const baseOptions = [
        ['max-results', 20]
    ]

    const tokenOptions = token
        ? [ [ 'starting-token', token ] ]
        : []

    return concat(baseOptions, tokenOptions)
}

export function findUserPoolIdByName(cognitoIdp, userPoolName, token) {
    const options = computeListUserPools(token)
    const command = cognitoIdp('list-user-pools') (options)

    console.log(command)

    return executeCommand(command)
        .then(JSON.parse)
        .then(res => {
            if (isEmpty(res)) {
                return null
            }

            const {UserPools, NextToken} = res
            const found = find(item => item.Name === userPoolName) (UserPools)

            if (found) {
                return found.Id
            }
            else if(NextToken) {
                return findUserPoolIdByName(cognitoIdp, userPoolName, NextToken)
            }
            else {
                return null
            }
        })
}
