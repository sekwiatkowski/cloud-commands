#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {performSequentially} from '../../perform-sequentially'
import {entries, map} from 'compose-functions'
import {createAwsCli} from '../../aws-cli'
import {parseFunctions} from '../../cli-arguments'
import {updateFunctionConfiguration} from '../../actions/functions/update-function-code'

(async () => {
    const { profile, region, functions, runtime, role, vpc } = await parseConfigurationFile('aws.json')
    const specifiedFunctions = parseFunctions(functions)

    const awsCli = createAwsCli(profile, region)
    const lambdaCli = awsCli('lambda')

    const namesAndConfigurations = entries(specifiedFunctions)

    const boundUpdateFunctionConfiguration = updateFunctionConfiguration(lambdaCli, role, runtime, vpc)

    const actions = map(([name, configuration]) => () => boundUpdateFunctionConfiguration(name, configuration)) (namesAndConfigurations)

    await performSequentially(actions)
})()