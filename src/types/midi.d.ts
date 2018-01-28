declare module 'midi' {

    export type Message = [number, number, number];

    /**
     * Midi input.
     */
    export class input {

        constructor();

        /**
         * Count the available input ports.
         */
        getPortCount(): number;

        /**
         * Get the name of a specified input port.
         */
        getPortName(port: number): number;

        closePort(): void;

        openPort(port: number): void;

        /**
         * Sysex, timing, and active sensing messages are ignored
         * by default. To enable these message types, pass false for
         * the appropriate type in the function below.
         * Order: (Sysex, Timing, Active Sensing)
         * For example if you want to receive only MIDI Clock beats
         * you should use
         * input.ignoreTypes(true, false, true)
         */
        ignoreTypes(sysex: boolean, timing: boolean, activeSensing: boolean): void;

        on(type: 'message', handler: (deltaTime: number, message: Message) => void): void
    }
}