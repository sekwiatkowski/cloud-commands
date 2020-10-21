import {
    allPass,
    contains,
    difference,
    drop, isEmpty,
    isNotEmpty,
    isOfLengthOne, joinWithCommaSpace,
    joinWithSemicolon,
    keys,
    length, values
} from 'compose-functions'

const containsWildcardOnly = allPass([ isOfLengthOne, contains('*') ])

function extractCliArguments () {
    return drop(2)(process.argv)
}

export function parseFunctionNames(functions) {
    const specifiedFunctionNames = extractCliArguments()

    if (isEmpty(specifiedFunctionNames)) {
        console.error('Please specify at least one function.')
        process.exit(1)
    }

    const allFunctionNames = keys(functions)

    if (containsWildcardOnly(specifiedFunctionNames)) {
        return allFunctionNames
    }

    const unknownFunctionNames = difference(specifiedFunctionNames)(allFunctionNames)

    if (isNotEmpty(unknownFunctionNames)) {
        if (isOfLengthOne (unknownFunctionNames)) {
            console.error(`The specified function ${unknownFunctionNames[0]} is unknown.`)
            process.exit(1)
        }
        else {
            console.error(`The following specified functions are unknown: ${joinWithCommaSpace(unknownFunctionNames)}`)
            process.exit(length(unknownFunctionNames))
        }
    }

    return specifiedFunctionNames
}

export function parseApiFunctionNames(routes) {
    const specifiedFunctionNames = extractCliArguments()

    if (isEmpty(specifiedFunctionNames)) {
        console.error('Please specify at least one function used by the API.')
        process.exit(1)
    }

    const usedFunctionNames = values(routes)

    if (containsWildcardOnly(specifiedFunctionNames)) {
        return usedFunctionNames
    }

    const unknownFunctionNames = difference(specifiedFunctionNames)(usedFunctionNames)

    if (isNotEmpty(unknownFunctionNames)) {
        if (isOfLengthOne (unknownFunctionNames)) {
            console.error(`The specified function ${unknownFunctionNames[0]} is not used by the API.`)
            process.exit(1)
        }
        else {
            console.error(`The following specified functions are unknown: ${joinWithCommaSpace(unknownFunctionNames)}`)
            process.exit(length(unknownFunctionNames))
        }
    }

    return specifiedFunctionNames
}