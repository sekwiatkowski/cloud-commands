import {joinWithComma, joinWithEqualitySign, mapEntries, surroundWithDoubleQuotes} from 'standard-functions'

function serializeSetting([key, value]) {
    const escapedValue = surroundWithDoubleQuotes(value)

    return joinWithEqualitySign(key, escapedValue)
}

export default function serializeStageVariables(stageVariables) {
    const settings = mapEntries(serializeSetting) (stageVariables)

    return joinWithComma(settings)
}