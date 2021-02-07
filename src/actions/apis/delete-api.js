import {executeCommand} from '../../execution'
import {findApiIdByName} from '../../additional-information/api-id'
import combineApiAndStageName from '../../api-name'
import {performSequentially} from '../../perform-sequentially'
import {map} from 'standard-functions'

function computeDeleteApiOptions(apiId) {
    return [
        ['api-id', apiId]
    ]
}

async function deleteStageApi(apiGatewayV2, apiName, stageName) {
    console.log(`Deleting the API for the "${stageName}" stage ...`)

    const combinedName = combineApiAndStageName(apiName) (stageName)

    const apiId = await findApiIdByName(apiGatewayV2, combinedName)

    const options = computeDeleteApiOptions(apiId)

    const command = apiGatewayV2('delete-api') (options)

    return executeCommand(command)
}

export default function deleteApi(apiGatewayV2, apiName, stageNames) {
    console.log(`Deleting ${apiName} ...`)

    const actions = map(stageName => () => deleteStageApi(apiGatewayV2, apiName, stageName))(stageNames)

    return performSequentially(actions)
}
