import {joinWithComma, joinWithEqualitySign} from 'standard-functions'

function computeFragment(key) {
    return arr => {
        const list = joinWithComma(arr)
        return joinWithEqualitySign([key, list])
    }
}

const computeSubnetFragment = computeFragment('SubnetIds')
const computeSecurityGroupFragment = computeFragment('SecurityGroupIds')

export function computeVpcConfig({subnetIds, securityGroupIds}) {
    return joinWithComma([
        computeSubnetFragment(subnetIds),
        computeSecurityGroupFragment(securityGroupIds)
    ])
}
