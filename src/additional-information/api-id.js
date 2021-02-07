import {executeCommand} from '../execution'

const getApis = [
    'get-apis',
    []
]

function computeResumeGetApis(token) {
    return [
        'get-apis',
        [
            ['starting-token', token]
        ]
    ]
}

export function findApiIdByName(apiGatewayV2, apiName, token) {
    const [subcommand, options] = token ? computeResumeGetApis(token) : getApis

    const command = apiGatewayV2(subcommand) (options)
    console.log(command)

    return executeCommand(command)
        .then(JSON.parse)
        .then(({Items, NextToken}) => {
            const found = Items.find(item => item.Name === apiName)

            if (found) {
                return found.ApiId
            }
            else if(NextToken) {
                return findApiIdByName(apiGatewayV2, apiName, NextToken)
            }
            else {
                return null
            }
        })
}