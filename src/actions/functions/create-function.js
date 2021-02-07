import {executeInDirectory} from '../../execution'
import {concat} from 'standard-functions'
import {computeTagsSetting, computeZipSetting, createUpdateFunctionConfiguration} from '../../function-configuration'

function computeCreateOptions(name, role, runtime, timeout, vpc, description, api) {
    const updateOptions = createUpdateFunctionConfiguration(name, role, runtime, timeout, vpc, description)

    const zipFileOptions = [
        ['zip-file', computeZipSetting(name)]
    ]

    const tagOptions = api
        ? [['tags', computeTagsSetting(api.name)]]
        : []

    return concat(updateOptions, zipFileOptions, tagOptions)
}

export function createFunction(lambda) {
    return (role, runtime, globalTimeout, globalVpc, api) => {
        return (name, {description, timeout, vpc}) => {
            console.log(`Creating function ${name} ...`)

            const options = computeCreateOptions(name, role, runtime, timeout ?? globalTimeout, vpc ?? globalVpc, description, api)

            const command = lambda('create-function') (options)

            const cwd = `dist\\${name}`

            return executeInDirectory(command, cwd)
        }
    }
}
