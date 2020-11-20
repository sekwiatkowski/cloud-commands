import {executeCommand} from '../execution'
import {append, find, isEmpty, mapSecond} from 'standard-functions'

const listUserPools = [
    'list-user-pools',
    [
        ['max-results', 20]
    ]
]

function computeListUserPools(token) {
    const appendToken = append(['starting-token', token])

    return mapSecond(appendToken)(listUserPools)
}

export function findUserPoolIdByName(cognitoIdp, userPoolName, token) {
    const [subcommand, options] = token
        ? computeListUserPools(token)
        : listUserPools

    return executeCommand(cognitoIdp(subcommand) (options))
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
