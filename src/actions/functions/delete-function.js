import {performSequentially} from '../../perform-sequentially'
import {map} from 'standard-functions'
import {executeCommand} from '../../execution'

function deleteFunction(lambda) {
    return name => {
        console.log(`Deleting function ${name} ...`)

        const options = [
            ['function-name', name]
        ]

        const command = lambda('delete-function')(options)

        console.log(command)

        return executeCommand(command)
    }
}

export default function deleteFunctions(lambda, functionNames) {
    const actions = map(name => () => deleteFunction(lambda) (name))(functionNames)

    return performSequentially(actions)
}