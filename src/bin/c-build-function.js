#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import getArguments from '../cli'
import {map} from 'compose-functions'
import {performSequentially} from '../perform-sequentially'
import {parseConfigurationFile} from '../configuration'
import buildFunction from '../actions/build-function'
import deleteDistribution from '../actions/delete-distribution'

(async () => {
    const functionNames = getArguments()
    const { esbuild } = await parseConfigurationFile('aws.json')

    const actions = map
        (name => () => deleteDistribution(name).then(() => buildFunction(esbuild)(name)))
        (functionNames)

    performSequentially(actions)
})()