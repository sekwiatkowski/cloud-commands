import path from "path"
import {executeInCurrentWorkingDirectory} from '../execution'
import {concat, joinWithSpace, map} from 'compose-functions'

function computeExternalOptions(externalConfiguration) {
    const baseOptions = [
        '--external:aws-sdk'
    ]

    const additionalOptions = externalConfiguration
        ? map(external => `--external:${external}`) (externalConfiguration)
        : []

    return concat(baseOptions) (additionalOptions)
}

function computeEsBuildOptions({ external }) {
    return (sourcePath, buildPath) => {
        const baseOptions = [
            '--bundle',
            '--platform=node',
            sourcePath,
            `--outfile=${buildPath}`
        ]

        const externalOptions = computeExternalOptions(external)

        const options = joinWithSpace(baseOptions.concat(externalOptions))

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

        return executeInCurrentWorkingDirectory(command)
    }
}