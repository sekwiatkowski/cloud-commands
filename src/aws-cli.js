import {isArray, joinWithSpace, map} from 'standard-functions'

function generateOption(option) {
    switch (isArray(option)) {
        case true:
            const [key, value] = option
            return `--${key} ${value}`
        case false:
            return `--${option}`
    }
}

export function createAwsCli(profile, region) {
    return service => command => options =>
        joinWithSpace(
            'aws',
            service,
            command,
            joinWithSpace(map(generateOption)([
                ['profile', profile],
                ['region', region],
                ...options
            ]))
        )
}