export interface Storage {
    config: Config;
    cors: boolean;
}

const DEFAULT_CONFIG: Config = {
    noJs: false,
    noCss: false,
    noIFrames: false,
    noImages: false,
};
const DEFAULT_CORS = false;
export const DEFAULT_STORAGE: Storage = {
    config: DEFAULT_CONFIG,
    cors: DEFAULT_CORS,
};

export async function loadFromStorage() {
    return new Promise<Storage>(resolve => {
        chrome.storage.local.get(['config', 'cors'], items => {
            console.log('load!', items);
            resolve({
                ...DEFAULT_STORAGE,
                ...items,
            });
        });
    });
}

export async function storeToStorage(config: Config, cors: boolean) {
    console.log('store!', config, cors);
    return new Promise<void>(resolve => {
        const s: Storage = { config, cors };
        chrome.storage.local.set(s, resolve);
    });
}
