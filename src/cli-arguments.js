import {
    allPass,
    chunk,
    contains,
    difference,
    drop,
    first,
    isEmpty,
    isOfLengthOne,
    joinWithCommaSpace,
    joinWithSpace,
    keys,
    length,
    map,
    pick, unique,
    values
} from 'standard-functions'

export function extractCliArguments () {
    return drop(2) (process.argv)
}

export function exitIfEmpty(message) {
    return arr => {
        if (isEmpty(arr)) {
            console.error(message)
            process.exit(0)
        }
    }
}

const containsWildcardOnly = allPass([ isOfLengthOne, contains('*') ])

export function exitIfUnknown(singleMessage) {
    return multipleMessage=> arr => {
        if (isEmpty(arr)) {
            return
        }
        const message = isOfLengthOne(arr)
            ? singleMessage(first(arr))
            : multipleMessage(arr)

        console.error(message)
        process.exit(1)
    }
}

export function parseFunctionNames(functions) {
    const selectedFunctionNames = extractCliArguments()

    exitIfEmpty('Please specify at least one function.') (selectedFunctionNames)

    const allFunctionNames = keys(functions)

    if (containsWildcardOnly(selectedFunctionNames)) {
        return allFunctionNames
    }

    const unknownFunctionNames = difference(selectedFunctionNames) (allFunctionNames)

    exitIfUnknown
        (single => `Function "${single}" is unknown.`)
        (multiple => `The following functions are unknown: ${joinWithCommaSpace(multiple)}`)
        (unknownFunctionNames)

    return selectedFunctionNames
}

export function parseFunctions(functions) {
    const specifiedFunctionNames = parseFunctionNames(functions)

    return pick(specifiedFunctionNames) (functions)
}

export function parseApiFunctionNames(routes) {
    const selectedFunctionNames = extractCliArguments()

    exitIfEmpty('Please specify at least one function used by the API.') (selectedFunctionNames)

    const usedFunctionNames = unique(values(routes))

    if (containsWildcardOnly(selectedFunctionNames)) {
        return usedFunctionNames
    }

    const unknownFunctionNames = difference(selectedFunctionNames) (usedFunctionNames)

    exitIfUnknown
        (single => `Function "${single}" is not used by the API.`)
        (multiple => `The following API functions are unknown: ${joinWithCommaSpace(multiple)}`)
        (unknownFunctionNames)

    return selectedFunctionNames
}

export const extractBigrams = chunk(2)

export function parseApiRoutes(routes) {
    const userInput = extractCliArguments()
    const bigrams = extractBigrams(userInput)

    const knownRouteKeys = keys(routes)

    if (containsWildcardOnly(userInput)) {
        return routes
    }

    if (length(userInput) % 2 === 1) {
        console.error(`Please specify a space-separated list of route keys.`)
        process.exit(1)
    }

    const specifiedRouteKeys = map(joinWithSpace) (bigrams)

    const unknownRouteKeys = difference(specifiedRouteKeys)(knownRouteKeys)

    exitIfUnknown
        (single => `Route key "${single}" is unknown.`)
        (multiple => `The following route keys are unknown: ${joinWithCommaSpace(multiple)}`)
        (unknownRouteKeys)

    return pick(specifiedRouteKeys) (routes)
}

export function parseApiStages(knownStages) {
    const selectedStages = extractCliArguments()

    exitIfEmpty('Please specify at least one API stage.') (selectedStages)

    if (containsWildcardOnly(selectedStages)) {
        return knownStages
    }

    const unknownStages = difference(selectedStages) (keys(knownStages))

    exitIfUnknown
        (single => `API stage "${single}" is unknown.`)
        (multiple => `The following API stages are unknown: ${joinWithCommaSpace(multiple)}`)
        (unknownStages)

    return pick(selectedStages) (knownStages)
}

export function parseUserPoolClients(knownClients) {
    const selectedClients = extractCliArguments()

    exitIfEmpty('Please specify at least one user pool client.') (selectedClients)

    if (containsWildcardOnly(selectedClients)) {
        return knownClients
    }

    const unknownStages = difference(selectedClients) (knownClients)

    exitIfUnknown
        (single => `User pool client "${single}" is unknown.`)
        (multiple => `The following clients are unknown: ${joinWithCommaSpace(multiple)}`)
        (unknownStages)

    return pick(selectedClients) (knownClients)
}