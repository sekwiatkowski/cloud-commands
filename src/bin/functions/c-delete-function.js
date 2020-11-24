#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {getAllFunctionNames} from '../../additional-information/all-function-names'
import {exitIfEmpty, exitIfUnknown, extractCliArguments} from '../../cli-arguments'
import {difference, joinWithCommaSpace} from 'standard-functions'
import deleteFunctions from '../../actions/functions/delete-function'

(async () => {
    const { profile, region} = await parseConfigurationFile('aws.json')

    const selectedFunctions = extractCliArguments()
    exitIfEmpty('Please specify at least one function.') (selectedFunctions)

    const awsCli = createAwsCli(profile, region)
    const lambda = awsCli('lambda')

    console.log('Retrieving existing functions ...')
    const existingFunctions = await getAllFunctionNames(lambda)

    const unknownFunctions = difference(selectedFunctions) (existingFunctions)

    exitIfUnknown
        (name => `A function named "${name}" does not exist.`)
        (names => `Functions with the following names do not exist: ${joinWithCommaSpace(names)}.`)
        (unknownFunctions)

    await deleteFunctions(lambda, selectedFunctions)
})()