import {drop} from 'compose-functions'

export default function getArguments() {
    return drop(2)(process.argv)
}