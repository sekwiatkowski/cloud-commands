#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import getArguments from '../cli'

(async () => {
    const functionNames = getArguments()
    const configuration = await parseConfigurationFile('aws.json')

    console.log(configuration)
    console.log(functionNames)
})()