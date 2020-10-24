import {fold} from 'compose-functions'

export async function performSequentially(actions) {
    return fold(
            (accP, action) => Promise
                .all([accP, action()])
                .then(([acc, result]) => acc.concat(result))
        )
        (Promise.resolve([]))
        (actions)
}