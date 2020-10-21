#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {map} from 'compose-functions'
import {performSequentially} from '../perform-sequentially'
import zipFunction from '../actions/zip-function'
import deleteDistribution from '../actions/delete-distribution'
import buildFunction from '../actions/build-function'
import {parseFunctionNames} from '../cli-arguments'


(async () => {
    const functionNames = parseFunctionNames()

    const actions = map
        (name => () => deleteDistribution(name).then(() => buildFunction(esbuild)(name)).then(() => zipFunction(name)))
        (functionNames)

    performSequentially(actions)
})()