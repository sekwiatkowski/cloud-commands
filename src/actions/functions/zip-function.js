import path from 'path'
import {executeInDirectory} from '../../execution'

export default function zipFunction(name) {
    console.log(`Creating ${name}.zip ...`)
    const command = `tar -a -c -f ${name}.zip index.js`
    const directory = path.join(process.cwd(), 'dist', name)

    return executeInDirectory(command, directory)
}

