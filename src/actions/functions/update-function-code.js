import {executeInDirectory} from '../../execution'

export function updateFunctionCode(lambda) {
    return name => {
        const options = [
            ['function-name', name],
            ['zip-file', `fileb://${name}.zip`]
        ]

        const command = lambda('update-function-code') (options)

        const cwd = `dist\\${name}`

        return executeInDirectory(command, cwd)
    }
}
