import {concat} from 'compose-functions'
import {computeVpcConfig} from '../../vpc-config'
import {executeInDirectory} from '../../execution'

function computeTags(apiName) {
    return `"API=${apiName}"`
}

function computeCreateOptions(role, runtime, name, description, vpc, api) {
    const baseOptions = [
        ['role', role],
        ['runtime', runtime],
        ['function-name', name],
        ['description', `"${description}"`],
        ['zip-file', `fileb://${name}.zip`],
        ['handler', 'index.handler']
    ]

    const vpcOptions = vpc
        ? [['vpc-config', computeVpcConfig(vpc)]]
        : []

    const tagOptions = api
        ? [['tags', computeTags(api.name)]]
        : []

    const options = concat([ baseOptions, vpcOptions, tagOptions ])

    return options
}

export function createFunction(lambda) {
    return (role, runtime, vpc, api) => {
        return (name, {description}) => {
            console.log(`Creating function ${name}`)

            const options = computeCreateOptions(role, runtime, name, description, vpc, api)

            const command = lambda('create-function') (options)

            console.log(command)

            const cwd = `dist\\${name}`

            return executeInDirectory(command, cwd)
        }
    }
}
