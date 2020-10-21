#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node

import {parseConfigurationFile} from '../configuration'
import {createAwsCli} from '../aws-cli'
import {createApi} from '../actions/create-api'

(async () => {
    const { api, profile, region } = await parseConfigurationFile('aws.json')

    if (!api) {
        console.error('No API has been configured.')
        process.exit(1)
    }

    const awsCli = createAwsCli(profile, region)
    const apiGatewayV2 = awsCli('apigatewayv2')

    await createApi(apiGatewayV2, api)
})()