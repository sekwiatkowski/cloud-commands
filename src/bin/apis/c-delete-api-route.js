#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {extractBigrams, extractCliArguments} from '../../cli-arguments'
import {findApiIdByName} from '../../additional-information/api-id'
import {getAllRouteKeys} from '../../additional-information/all-api-route-keys'
import {
    filter,
    first,
    isLongerThan,
    isNotEmpty,
    isOfLengthOne,
    isPropertyOf,
    joinWithCommaSpace,
    joinWithSpace,
    map,
    pick
} from 'standard-functions'
import {deleteApiRoutes} from '../../actions/apis/delete-api-route'

(async () => {
    const { profile, region, api } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const { name } = api

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    console.log('Retrieving API ID ...')
    const apiId = await findApiIdByName(apiGatewayV2, name)

    console.log('Retrieving existing routes ...')
    const routeKeyMapping = await getAllRouteKeys(apiGatewayV2, apiId)

    const userInput = extractCliArguments()
    const routeKeysToBeDeleted = extractBigrams(userInput)
    const serializedRouteKeysToBeDeleted = map(joinWithSpace) (routeKeysToBeDeleted)

    const doesNotExist = routeKey => !isPropertyOf(routeKeyMapping) (routeKey)
    const unknownRouteKeys = filter(doesNotExist) (serializedRouteKeysToBeDeleted)

    if(isNotEmpty(unknownRouteKeys)) {
        if (isOfLengthOne(unknownRouteKeys)) {
            console.error(`A route with the key ${first(unknownRouteKeys)} does not exist.`)
            process.exit(-1)
        }
        else if (isLongerThan(1)(unknownRouteKeys)) {
            console.error(`Routes with the following keys do not exist: ${joinWithCommaSpace(unknownRouteKeys)}.`)
            process.exit(-1)
        }
    }

    const routeKeysAndIds = pick(serializedRouteKeysToBeDeleted) (routeKeyMapping)

    await deleteApiRoutes(apiGatewayV2, apiId, routeKeysAndIds)
})()