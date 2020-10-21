import {
    allPass,
    contains,
    difference,
    drop,
    isNotEmpty,
    isOfLengthOne, joinWithCommaSpace,
    joinWithSemicolon,
    keys,
    length
} from 'compose-functions'

const containsWildcardOnly = allPass([ isOfLengthOne, contains('*') ])

export default function parseFunctionNames(functions) {
    const specifiedFunctionNames = drop(2)(process.argv)
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