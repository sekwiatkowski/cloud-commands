import {executeCommand} from '../../execution'
import {createUpdateFunctionConfiguration} from '../../function-configuration'

export function updateFunctionConfiguration(lambda, role, runtime, globalVpc, api) {
    return (name, {description, vpc}) => {
        const options = createUpdateFunctionConfiguration(name, role, runtime, vpc ?? globalVpc, description, api)

        const command = lambda('update-function-configuration')(options)

        console.log(command)

        return executeCommand(command)
    }
}
