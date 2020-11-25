import path from 'path'
import {executeInDirectory} from '../../execution'
import {concat, joinWithSpace, map} from 'standard-functions'

function computeExternalOptions(externalConfiguration) {
    return externalConfiguration
        ? map(external => `--external:${external}`) (externalConfiguration)
        : []
}

function computeEsBuildOptions(configuration) {
    return (sourcePath, buildPath) => {
        const baseOptions = [
            '--bundle',
            '--platform=node',
            '--target=node12',
            sourcePath,
            `--outfile=${buildPath}`,
            '--external:aws-sdk'
        ]

        const externalOptions = configuration ? computeExternalOptions(configuration.external) : []

        const options = joinWithSpace(concat([ baseOptions, externalOptions ]))

        return options
    }
}

export default function buildFunction(esbuildConfiguration) {
    return name => {
        console.log(`Building function ${name} ...`)

        const sourcePath = path.join(...['src', 'functions', `${name}.js`])
        const buildPath = path.join('dist', name, 'index.js')

        const options = computeEsBuildOptions(esbuildConfiguration) (sourcePath, buildPath)

        const command = `esbuild ${options}`

        const directory = process.cwd()

        console.log(`[${directory}] ${command}`)

        return executeInDirectory(command, directory)
    }
}