import fs from 'fs-extra'

export function parseConfigurationFile(path) {
    return fs.exists(path)
        .then(doesExist => {
            if (!doesExist) {
                throw Error ('Configuration file does not exist.')
            }
        })
        .then(() => fs.readFile(path, 'utf-8'))
        .catch(() => Promise.reject('Configuration could not be read.'))
        .then(JSON.parse)
        .catch(() => Promise.reject('Configuration could not be parsed.'))
}