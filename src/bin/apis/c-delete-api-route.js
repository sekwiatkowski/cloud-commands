#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../../configuration'
import {createAwsCli} from '../../aws-cli'
import {exitIfEmpty, exitIfUnknown, extractBigrams, extractCliArguments} from '../../cli-arguments'
import {findApiIdByName} from '../../additional-information/api-id'
import {getAllRouteKeys} from '../../additional-information/all-api-route-keys'
import {
    difference,
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

    const userInput = extractCliArguments()
    const routeKeysToBeDeleted = extractBigrams(userInput)

    exitIfEmpty('Please specify at least one route.') (routeKeysToBeDeleted)

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    console.log('Retrieving API ID ...')
    const apiId = await findApiIdByName(apiGatewayV2, name)

    console.log('Retrieving existing routes ...')
    const routeKeyMapping = await getAllRouteKeys(apiGatewayV2, apiId)
    const serializedRouteKeysToBeDeleted = map(joinWithSpace) (routeKeysToBeDeleted)

    const unknownRouteKeys = difference (serializedRouteKeysToBeDeleted) (keys(routeKeyMapping))
    exitIfUnknown
        (key => `A route with the key "${key}" does not exist.`)
        (keys => `Routes with the following keys do not exist: ${joinWithCommaSpace(keys)}.`)
        (unknownRouteKeys)

    const routeKeysAndIds = pick(serializedRouteKeysToBeDeleted) (routeKeyMapping)

    await deleteApiRoutes(apiGatewayV2, apiId, routeKeysAndIds)
})()