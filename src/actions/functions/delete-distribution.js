import path from 'path'
import fs from 'fs-extra'

export default function deleteDistribution(functionName) {
    const directory = path.join('dist', functionName)
    console.log(`Removing directory ${directory} ...`)

    return fs.remove(directory)
}