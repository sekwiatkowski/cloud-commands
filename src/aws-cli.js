import {isArray, map} from 'compose-functions'

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
        [
            'aws',
            service,
            command,
            map(generateOption)([
                ['profile', profile],
                ['region', region],
                ...options
            ]).join(' ')
        ].join(' ')
}