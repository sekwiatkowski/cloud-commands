#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import {createAwsCli} from '../aws-cli'
import {createApi} from '../actions/create-api'
import {findApiIdByName} from '../additional-information/api-id'
import {deleteApi} from '../actions/delete-api'

(async () => {
    const { api, profile, region } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    const { name } = api

    const id = await findApiIdByName(apiGatewayV2, name)

    await deleteApi(apiGatewayV2, name, id)
})()