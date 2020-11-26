import {executeCommand} from '../../execution'


export default function deleteUserPool(cognitoIdp, name, id) {
    console.log(`Deleting user pool ${name} ....`)

    const options = [
        ['user-pool-id', id]
    ]

    const command = cognitoIdp('delete-user-pool') (options)

    console.log(command)

    return executeCommand(command)
}