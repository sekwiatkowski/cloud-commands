#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {performSequentially} from '../perform-sequentially'
import {map} from 'compose-functions'
import deleteDistribution from '../actions/delete-distribution'
import parseFunctionNames from '../cli-arguments'
import {parseConfigurationFile} from '../configuration'

(async () => {
    const { functions } = await parseConfigurationFile('aws.json')
    const functionNames = parseFunctionNames(functions)

    const actions = map(name => () => deleteDistribution(name))(functionNames)

    performSequentially(actions)
})()