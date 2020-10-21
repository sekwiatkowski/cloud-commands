import {fold} from 'compose-functions'

export function performSequentially(actions) {
    return fold
        ((p, action) => p.then(() => action()))
        (Promise.resolve())
        (actions)

}