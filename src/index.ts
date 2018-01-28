import * as yargs from 'yargs'

import { ThereminSampler } from './theremin'
import { createGroupLightController, createSingleLightController } from './light'

const groupName = 'theremin'

async function main(args: yargs.Arguments) {
    const lights: number[] = args['lights'].split(',')
        .map((x: string) => +x)
        .filter((x: number) => !isNaN(x))

    if (lights.length <= 0) {
        throw new Error("No valid lights supplied")
    }

    const theremin = new ThereminSampler({
        pitchChannel: args['pitchChannel'],
        volumeChannel: args['volumeChannel'],
        midiPort: 0
    })

    const lightConfig = {
        host: args['hueHost'],
        username: args['hueUsername']
    };
    const controller = lights.length === 1
        ? await createSingleLightController(lights[0], lightConfig)
        : await createGroupLightController(groupName, lights, lightConfig)

    controller.beginSampling(() => {
        // Simple pitch->color, volume->brightness mapping
        return {
            hue: Math.floor(theremin.pitch * 359),
            saturation: 100,
            brightness: Math.floor(theremin.volume * 100)
        }
    })

    return controller
}

const argv = yargs
    .option('hueHost', {
        demandOption: true,
        describe: 'Hue host, e.g. 192.168.1.4',
        type: 'string'
    })
    .option('hueUsername', {
        demandOption: true,
        describe: 'Hue device username',
        type: 'string'
    })
    .option('lights', {
        demandOption: true,
        describe: 'List of light names to control, e.g. 1,2',
        type: 'string'
    })
    .option('pitchChannel', {
        demandOption: true,
        describe: 'Midi channel for pitch',
        default: 176,
        type: 'number'
    })
    .option('volumeChannel', {
        demandOption: true,
        describe: 'Midi channel for volume',
        default: 177,
        type: 'number'
    })
    .argv

main(argv).catch(console.error)