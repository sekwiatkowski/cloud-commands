export default function combineApiAndStageName(apiName) {
    return stageName => `${stageName}: ${apiName}`
}