import {fold} from 'standard-functions'

export async function performSequentially(actions) {
    return fold(
            (accP, action) => Promise
                .all([accP, action()])
                .then(([acc, result]) => [...acc, result])
        )
        (Promise.resolve([]))
        (actions)
}