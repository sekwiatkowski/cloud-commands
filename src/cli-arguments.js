import {
    allPass,
    chunk,
    contains,
    difference,
    drop,
    isEmpty,
    isNotEmpty,
    isOfLengthOne,
    joinWithCommaSpace,
    joinWithSpace,
    keys,
    length,
    map,
    pick,
    values
} from 'standard-functions'

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
            console.error(`Specified function "${unknownFunctionNames[0]}" is unknown.`)
            process.exit(1)
        }
        else {
            console.error(`The following specified functions are unknown: ${joinWithCommaSpace(unknownFunctionNames)}`)
            process.exit(length(unknownFunctionNames))
        }
    }

    return specifiedFunctionNames
}

export function parseFunctions(functions) {
    const specifiedFunctionNames = parseFunctionNames(functions)

    return pick(specifiedFunctionNames)(functions)
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
            console.error(`Specified function "${unknownFunctionNames[0]}" is not used by the API.`)
            process.exit(1)
        }
        else {
            console.error(`The following specified functions are unknown: ${joinWithCommaSpace(unknownFunctionNames)}`)
            process.exit(length(unknownFunctionNames))
        }
    }

    return specifiedFunctionNames
}

export function parseApiRoutes(routes) {
    const userInput = extractCliArguments()

    const knownRouteKeys = keys(routes)

    if (containsWildcardOnly(userInput)) {
        return routes
    }

    if (length(userInput) % 2 === 1) {
        console.error(`Please specify a space-separated list of route keys.`)
        process.exit(1)
    }

    const bigrams = chunk(2) (userInput)

    const specifiedRouteKeys = map(joinWithSpace) (bigrams)

    const unknownRouteKeys = difference(specifiedRouteKeys)(knownRouteKeys)

    if (isNotEmpty(unknownRouteKeys)) {
        if (isOfLengthOne (unknownRouteKeys)) {
            console.error(`Specified route key "${unknownRouteKeys[0]}" is unknown.`)
            process.exit(1)
        }
        else {
            console.error(`The following specified route keys are unknown: ${joinWithCommaSpace(unknownRouteKeys)}`)
            process.exit(length(unknownRouteKeys))
        }
    }

    return pick(specifiedRouteKeys)(routes)
}

export function parseApiStages(knownStages) {
    const specifiedStages = extractCliArguments()

    if (isEmpty(specifiedStages)) {
        console.error(`Please specify at least one API stage.`)
        process.exit(1)
    }

    if (containsWildcardOnly(specifiedStages)) {
        return knownStages
    }

    const unknownStages = difference(specifiedStages)(knownStages)

    if (isNotEmpty(unknownStages)) {
        if (isOfLengthOne (unknownStages)) {
            console.error(`Specified stage "${unknownStages[0]}" is unknown.`)
            process.exit(1)
        }
        else {
            console.error(`The following specified stages are unknown: ${joinWithCommaSpace(unknownStages)}`)
            process.exit(length(unknownStages))
        }
    }

    return unknownStages
}