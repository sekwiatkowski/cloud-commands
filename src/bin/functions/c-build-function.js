#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {map} from 'compose-functions'
import {performSequentially} from '../../perform-sequentially'
import {parseConfigurationFile} from '../../configuration'
import buildFunction from '../../actions/functions/build-function'
import deleteDistribution from '../../actions/functions/delete-distribution'
import {parseFunctionNames} from '../../cli-arguments'

(async () => {
    const { functions, esbuild } = await parseConfigurationFile('aws.json')
    const functionNames = parseFunctionNames({ functions })

    const actions = map
        (name => () => deleteDistribution(name).then(() => buildFunction(esbuild)(name)))
        (functionNames)

    await performSequentially(actions)
})()