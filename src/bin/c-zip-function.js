#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import getArguments from '../cli'
import {map} from 'compose-functions'
import {performSequentially} from '../perform-sequentially'
import zipFunction from '../actions/zip-function'


(async () => {
    const functionNames = getArguments()

    const actions = map
        (name => () => zipFunction(name))
        (functionNames)

    performSequentially(actions)
})()