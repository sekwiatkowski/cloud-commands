#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import {performSequentially} from '../perform-sequentially'
import {createFunction} from '../actions/create-function'
import {entries, map, pick, property} from 'compose-functions'
import {createAwsCli} from '../aws-cli'
import parseFunctionNames from '../cli-arguments'
import deleteDistribution from '../actions/delete-distribution'
import buildFunction from '../actions/build-function'
import zipFunction from '../actions/zip-function'

(async () => {
    const { profile, region, functions, esbuild, runtime, role, vpc, api } = await parseConfigurationFile('aws.json')
    const functionNames = parseFunctionNames(functions)

    const awsCli = createAwsCli(profile, region)
    const lambdaCli = awsCli('lambda')

    const namesAndConfigurations = entries(pick(functionNames)(functions))

    const boundCreateFunction = createFunction(lambdaCli)(role, runtime, vpc, api)

    const actions = map(([name, configuration]) => () =>
        deleteDistribution(name)
            .then(() => buildFunction(esbuild)(name))
            .then(() => zipFunction(name))
            .then(() => boundCreateFunction(name, configuration))
    ) (namesAndConfigurations)

    performSequentially(actions)
})()