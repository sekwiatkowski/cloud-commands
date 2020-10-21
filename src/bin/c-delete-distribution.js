#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import getArguments from '../cli'
import {performSequentially} from '../perform-sequentially'
import {map} from 'compose-functions'
import deleteDistribution from '../actions/delete-distribution'


(async () => {
    const functionNames = getArguments()

    const actions = map(name => () => deleteDistribution(name))(functionNames)

    performSequentially(actions)
})()