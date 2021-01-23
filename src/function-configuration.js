import {concat, isEmpty, joinWithComma, joinWithEqualitySign, toString} from 'standard-functions'

function computeVpcFragment(key) {
    return arr => {
        const list = isEmpty(arr)
            ? '[]'
            : joinWithComma(arr)

        return joinWithEqualitySign(key, list)
    }
}

const computeSubnetFragment = computeVpcFragment('SubnetIds')
const computeSecurityGroupFragment = computeVpcFragment('SecurityGroupIds')

function computeVpcSetting(configuration) {
    const { subnetIds, securityGroupIds } = configuration ?? {
        subnetIds: [],
        securityGroupIds: []
    }

    return joinWithComma(
        computeSubnetFragment(subnetIds),
        computeSecurityGroupFragment(securityGroupIds)
    )
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

    const vpcOptions = [['vpc-config', computeVpcSetting(vpc)]]

    const options = concat(baseOptions, timeoutOptions, vpcOptions)

    return options
}