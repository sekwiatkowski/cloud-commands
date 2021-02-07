import {executeCommand} from '../../execution'
import {createUpdateFunctionConfiguration} from '../../function-configuration'

export function updateFunctionConfiguration(lambda, role, runtime, globalTimeout, globalVpc) {
    return (name, {description, timeout, vpc}) => {
        const options = createUpdateFunctionConfiguration(name, role, runtime, timeout ?? globalTimeout, vpc ?? globalVpc, description)

        const command = lambda('update-function-configuration')(options)

        return executeCommand(command)
    }
}
