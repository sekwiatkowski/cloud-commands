import {concat, mapEntries, merge, surroundWithDoubleQuotes} from 'standard-functions'
import {executeCommand} from '../../execution'
import {performSequentially} from '../../perform-sequentially'
import combineApiAndStageName from '../../api-name'
import computeCorsOptions from '../../cors'

function computeBaseOptions(name, description) {
    return [
        ['name', surroundWithDoubleQuotes(name)],
        ['description', surroundWithDoubleQuotes(description)],
        ['protocol-type', 'HTTP']
    ]
}

function computeCreateApiOptions(name, description, cors, routes) {
    const baseOptions = computeBaseOptions(name, description)

    const corsOptions = cors ? computeCorsOptions(cors, routes) : []

    return concat(baseOptions, corsOptions)
}

export function createApi(apiGatewayV2, {name, description, cors, routes, stages}) {
    console.log(`Creating "${name}" APIs ...`)

    const actions = mapEntries(([_, stage]) => () => {
        console.log(`Creating the ${stage.name} API ...`)

        const mergedCors = merge(cors, stage.cors)

        const combinedName = combineApiAndStageName(name) (stage.name)
        const createOptions = computeCreateApiOptions(combinedName, description, mergedCors, routes)

        const command = apiGatewayV2('create-api') (createOptions)

        return executeCommand(command).then(JSON.parse)
    }) (stages)

    return performSequentially(actions)
}
