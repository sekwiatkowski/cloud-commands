#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {performSequentially} from '../../perform-sequentially'
import {createFunction} from '../../actions/functions/create-function'
import {entries, map} from 'compose-functions'
import {createAwsCli} from '../../aws-cli'
import deleteDistribution from '../../actions/functions/delete-distribution'
import buildFunction from '../../actions/functions/build-function'
import zipFunction from '../../actions/functions/zip-function'
import {parseFunctions} from '../../cli-arguments'

(async () => {
    const { profile, region, functions, esbuild, runtime, role, vpc, api } = await parseConfigurationFile('aws.json')
    const specifiedFunctions = parseFunctions(functions)

    const awsCli = createAwsCli(profile, region)
    const lambdaCli = awsCli('lambda')

    const namesAndConfigurations = entries(specifiedFunctions)

    const boundCreateFunction = createFunction(lambdaCli)(role, runtime, vpc, api)

    const actions = map(([name, configuration]) => () =>
        deleteDistribution(name)
            .then(() => buildFunction(esbuild)(name))
            .then(() => zipFunction(name))
            .then(() => boundCreateFunction(name, configuration))
    ) (namesAndConfigurations)

    await performSequentially(actions)
})()