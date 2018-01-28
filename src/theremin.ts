import midi = require('midi')


export interface ThereminConfig {
    readonly pitchChannel: number
    readonly volumeChannel: number
    readonly midiPort: number
}

export class ThereminSampler {
    private readonly input: midi.input
    private _pitch = 0
    private _volume = 0

    constructor(
        private readonly config: ThereminConfig
    ) {
        this.input = new midi.input()
        this.input.openPort(config.midiPort)
        this.input.ignoreTypes(false, false, false)

        this.input.on('message', (_deltaTime, message) => {
            switch (message[0]) {
                case this.config.pitchChannel:
                    this._pitch = toPercentage(message[2], 0, 120)
                    break

                case this.config.volumeChannel:
                    this._volume = toPercentage(message[2], 0, 120)
                    break
            }
        })
    }

    public get volume(): number { return this._volume; }
    public get pitch(): number { return this._pitch; }
}


function toPercentage(value: number, min: number, max: number) {
    const sample = (value - min) / (max - min)
    return Math.max(0, Math.min(1, sample))
}