// https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
// arn:partition:service:region:account-id:resource-id
// arn:partition:service:region:account-id:resource-type/resource-id

export default function computeArn(region) {
    return accountId => service => resource =>  [
        'arn',
        'aws',
        service,
        region,
        accountId,
        resource
    ].join(':')
}
