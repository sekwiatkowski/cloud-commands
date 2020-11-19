#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {performSequentially} from '../../perform-sequentially'
import {map} from 'standard-functions'
import {createAwsCli} from '../../aws-cli'
import deleteDistribution from '../../actions/functions/delete-distribution'
import buildFunction from '../../actions/functions/build-function'
import zipFunction from '../../actions/functions/zip-function'
import {parseFunctionNames} from '../../cli-arguments'
import {updateFunctionCode} from '../../actions/functions/update-function-code'

(async () => {
    const { profile, region, functions, esbuild} = await parseConfigurationFile('aws.json')
    const functionNames = parseFunctionNames(functions)

    const awsCli = createAwsCli(profile, region)
    const lambdaCli = awsCli('lambda')

    const boundBuildFunction = buildFunction(esbuild)
    const boundUpdateFunctionCode = updateFunctionCode(lambdaCli)

    const actions = map(name => () =>
        deleteDistribution(name)
            .then(() => boundBuildFunction(name))
            .then(() => zipFunction(name))
            .then(() => boundUpdateFunctionCode(name))
    ) (functionNames)

    await performSequentially(actions)
})()