import {promisify} from "util"
import child_process from "child_process"

const exec = promisify(child_process.exec)

function handleOutput(output) {
    const { err, stderr, stdout } = output
    if (err) {
        throw stderr
    }
    else {
        return stdout
    }
}

export function executeCommand(command) {
    console.log(command)

    return exec(command).then(handleOutput)
}

export function executeInDirectory(command, cwd) {
    console.log(`[${cwd}] ${command}`)

    return exec(command, { cwd }).then(handleOutput)
}
