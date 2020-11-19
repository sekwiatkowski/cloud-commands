#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {performSequentially} from '../../perform-sequentially'
import {map} from 'standard-functions'
import deleteDistribution from '../../actions/functions/delete-distribution'
import {parseConfigurationFile} from '../../configuration'
import {parseFunctionNames} from '../../cli-arguments'

(async () => {
    const { functions } = await parseConfigurationFile('aws.json')
    const functionNames = parseFunctionNames(functions)

    const actions = map(name => () => deleteDistribution(name))(functionNames)

    await performSequentially(actions)
})()