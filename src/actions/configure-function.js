import {executeCommand} from '../execution'
import {computeVpcConfig} from '../vpc-config'

export function configureFunction(lambda, role, runtime, vpc) {
    return (name, {description}) => {
        const options = [
            ['function-name', name],
            ['description', `"${description}"`],
            ['role', role],
            ['runtime', runtime],
            ['vpc-config', computeVpcConfig(vpc)]
        ]

        const command = lambda('update-function-configuration')(options)

        console.log(command)

        return executeCommand(command)
    }
}
