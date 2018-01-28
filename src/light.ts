const { HueApi, lightState } = require('node-hue-api')

export interface LightControllerConfig {
    readonly host: string
    readonly username: string
}

export type Sampler = () => { hue: number, saturation: number, brightness: number }

export interface LightController {
    beginSampling(
        sampler: Sampler
    ): void
}

class ApiLightController implements LightController {
    constructor(
        private readonly type: 'single' | 'group',
        private readonly id: number,
        private readonly api: any,
        private readonly timeout: number = 100
    ) { }

    public beginSampling(
        sampler: Sampler
    ) {
        const onDone = () => setTimeout(loop, this.timeout)

        const loop = () => {
            const sample = sampler()
            const newState = lightState.create().on().transitionInstant().hsb(sample.hue, sample.saturation, sample.brightness)
            if (this.type === 'single') {
                this.api.setLightState(this.id, newState).done(onDone, onDone);
            } else {
                this.api.setGroupLightState(this.id, newState).done(onDone, onDone);
            }
        }
        loop()
    }
}

/**
 * Create a new controller for a single light
 */
export async function createSingleLightController(
    light: number,
    config: LightControllerConfig
): Promise<LightController> {
    const api = await createHueApi(config)
    return new ApiLightController('single', light, api)
}

/**
 * Create a new controller for a group lights
 * 
 * Note that groups don't seem to update very well in my testing.
 */
export async function createGroupLightController(
    groupName: string,
    lightIds: number[],
    config: LightControllerConfig
): Promise<LightController> {
    const api = await createHueApi(config)
    const groupId = await createOrUpdateGroup(api, groupName, lightIds)
    return new ApiLightController('group', groupId, api, 250)
}

function createHueApi(
    config: LightControllerConfig
): Promise<any> {
    const api = new HueApi(config.host, config.username);
    return api.getFullState();
}

async function createOrUpdateGroup(
    api: any,
    groupName: string,
    lightIds: number[]
) {
    const groups: any[] = await api.groups();
    const existingGroup = groups.find(x => x.name === groupName);
    if (!existingGroup) {
        return (await api.createGroup(groupName, lightIds)).id;
    }

    await api.updateGroup(existingGroup.id, lightIds)
    return existingGroup.id
}
