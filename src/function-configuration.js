import {concat, joinWithComma, joinWithEqualitySign, toString} from 'standard-functions'

function computeFragment(key) {
    return arr => {
        const list = joinWithComma(arr)
        return joinWithEqualitySign([key, list])
    }
}

const computeSubnetFragment = computeFragment('SubnetIds')
const computeSecurityGroupFragment = computeFragment('SecurityGroupIds')

function computeVpcSetting({subnetIds, securityGroupIds}) {
    return joinWithComma([
        computeSubnetFragment(subnetIds),
        computeSecurityGroupFragment(securityGroupIds)
    ])
}

export function computeTagsSetting(apiName) {
    return `"API=${apiName}"`
}

export function computeZipSetting(functionName) {
    return `fileb://${functionName}.zip`
}

export function createUpdateFunctionConfiguration(name, role, runtime, timeout, vpc, description) {
    const baseOptions = [
        ['function-name', name],
        ['role', role],
        ['runtime', runtime],
        ['description', `"${description}"`],
        ['handler', 'index.handler']
    ]

    const timeoutOptions = timeout
        ? [['timeout', toString(timeout)]]
        : []

    const vpcOptions = vpc
        ? [['vpc-config', computeVpcSetting(vpc)]]
        : []

    const options = concat([ baseOptions, timeoutOptions, vpcOptions ])

    return options
}