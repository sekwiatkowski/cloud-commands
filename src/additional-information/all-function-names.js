import {concat, map, property} from 'standard-functions'
import {executeCommand} from '../execution'

function computeListFunctions(token) {
    const subcommand = 'list-functions'
    const baseOptions = [ ['max-items', 100] ]

    const tokenOptions = token
        ? [['starting-token', token]]
        : []

    return [subcommand, concat ([baseOptions, tokenOptions])]
}

export function getAllFunctionNames(lambda, collection = [], token = undefined) {
    const [subcommand, options] = computeListFunctions(token)

    return executeCommand(lambda(subcommand)(options))
        .then(JSON.parse)
        .then(({ Functions, NextToken }) => {
            const additionalFunctionNames = map(property('FunctionName'))(Functions)
            const updatedCollection = concat([collection, additionalFunctionNames])

            return NextToken
                ? listAllFunctions(lambda, updatedCollection, NextToken)
                : updatedCollection
        })
}