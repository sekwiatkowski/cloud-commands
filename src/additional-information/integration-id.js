import {last} from 'compose-functions'
import {executeCommand} from '../execution'

function computeGetIntegrations(apiId) {
    return [
        'get-integrations',
        [
            ['api-id', apiId]
        ]
    ]
}

function computeResumeGetIntegrations(apiId, token) {
    return `${computeGetIntegrations(apiId)} --starting-token ${token}`
}

export function findIntegrationIdsByNames(apiGatewayV2, apiId, functionNames, token) {
    const [ subcommand, options ] = token
        ? computeResumeGetIntegrations(apiId, token)
        : computeGetIntegrations(apiId)

    const searchResults = {}

    return executeCommand(apiGatewayV2(subcommand)(options))
        .then(JSON.parse)
        .then(({Items, NextToken}) => {
            Items.forEach(item => {
                const name = last(item.IntegrationUri.split(':'))

                if (functionNames.includes(name)) {
                    searchResults[name] = item.IntegrationId
                }
            })

            if (searchResults.length === functionNames.length || !NextToken) {
                return searchResults
            }
            else {
                return findIntegrationIdsByNames(apiGatewayV2, apiId, NextToken)
            }
        })
}