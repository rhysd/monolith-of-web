import { loadFromStorage, storeToStorage, Storage, DEFAULT_STORAGE } from './storage';

type GetButtonState = 'normal' | 'loading' | 'success';
class GetButton {
    private state: GetButtonState;

    constructor(private elem: HTMLButtonElement) {
        this.elem = elem;
        this.state = 'normal';
    }

    clear() {
        this.elem.classList.remove('is-loading', 'is-success');
        this.elem.classList.add('is-dark');
        this.setText('Get Monolith', 'arrow-down-bold-box');
        this.state = 'normal';
    }

    startLoading() {
        if (this.state !== 'normal') {
            this.clear();
        }
        this.elem.classList.add('is-loading');
        this.state = 'loading';
    }

    success() {
        this.elem.classList.remove('is-dark', 'is-loading');
        this.elem.classList.add('is-success');
        this.setText('Success!', 'check-bold');
        this.state = 'success';

        setTimeout(() => {
            if (this.state === 'success') {
                this.clear();
            }
        }, 2000);
    }

    onClick(cb: () => void) {
        this.elem.addEventListener('click', cb, { passive: true });
    }

    private setText(label: string, iconName: string) {
        this.elem.innerHTML = '';

        const icon = document.createElement('span');
        icon.className = 'icon';
        const check = document.createElement('i');
        check.className = `mdi mdi-${iconName}`;
        icon.appendChild(check);
        this.elem.appendChild(icon);

        const text = document.createElement('span');
        text.innerText = label;
        this.elem.appendChild(text);
    }
}

class ErrorMessage {
    constructor(
        private readonly container: HTMLElement,
        private readonly title: HTMLElement,
        private readonly body: HTMLElement,
        closeBtn: HTMLButtonElement,
    ) {
        this.close = this.close.bind(this);
        closeBtn.addEventListener('click', this.close, { passive: true });
    }

    show(title: string, message: string) {
        this.title.innerText = title;
        this.body.innerText = message;
        this.container.style.display = 'block';
    }

    close() {
        this.container.style.display = '';
    }
}

const COLOR_DISABLED = 'has-text-grey-light';
class ConfigButton {
    constructor(private readonly elem: HTMLElement) {
        elem.addEventListener('click', this.toggle.bind(this), { passive: true });
    }

    toggle() {
        this.set(!this.enabled());
    }

    set(enabled: boolean) {
        console.log('set!', enabled);
        if (enabled) {
            this.elem.classList.remove(COLOR_DISABLED);
        } else {
            this.elem.classList.add(COLOR_DISABLED);
        }
    }

    enabled() {
        return !this.elem.classList.contains(COLOR_DISABLED);
    }
}

const errorMessage = new ErrorMessage(
    document.getElementById('error-message') as HTMLElement,
    document.getElementById('error-title') as HTMLElement,
    document.getElementById('error-body') as HTMLElement,
    document.getElementById('error-close') as HTMLButtonElement,
);
const getButton = new GetButton(document.getElementById('get-monolith-btn') as HTMLButtonElement);
const configButtons = {
    noJs: new ConfigButton(document.getElementById('config-js') as HTMLElement),
    noCss: new ConfigButton(document.getElementById('config-css') as HTMLElement),
    noIFrames: new ConfigButton(document.getElementById('config-iframes') as HTMLElement),
    noImages: new ConfigButton(document.getElementById('config-images') as HTMLElement),
    allowCors: new ConfigButton(document.getElementById('config-allow-cors') as HTMLElement),
};

getButton.onClick(() => {
    getButton.startLoading();
    chrome.tabs.executeScript({ file: 'content.js' });
});

type BackgroundWindow = Window & {
    wasmLoadedInBackground?: boolean;
};

function pollBackgroundWindowLoaded() {
    return new Promise<boolean>(resolve => {
        chrome.runtime.getBackgroundPage(w => {
            resolve(!!(w as BackgroundWindow).wasmLoadedInBackground);
        });
    });
}

function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function waitForBackgroundPageLoaded() {
    // Retry for 12 * 250 = 3 seconds
    const retries = 12;
    const interval = 250;
    for (let c = 0; c < retries; ++c) {
        if (await pollBackgroundWindowLoaded()) {
            return;
        }
        await sleep(interval);
    }
    throw new Error(
        `No background page is open nor no background script was loaded successfully after ${retries / 4} seconds`,
    );
}

async function startMonolith(msg: MessageMonolithContent) {
    const config = {
        noJs: !configButtons.noJs.enabled(),
        noCss: !configButtons.noCss.enabled(),
        noIFrames: !configButtons.noIFrames.enabled(),
        noImages: !configButtons.noImages.enabled(),
    };
    const cors = configButtons.allowCors.enabled();

    const startMsg: MessageToBackground = {
        ...msg,
        type: 'bg:start',
        config,
        cors,
    };

    // Note: Retry is necessary since background page might not be fully opened yet.
    // In the case, popup page must wait for the background page being loaded.
    // When loading the background page, background.js loads Wasm file asynchronously.
    // We need to wait for the page being fully loaded. Otherwise, the callback to
    // receive bg:start is not set yet.
    await waitForBackgroundPageLoaded();

    // Note: Getting the background window object by chrome.runtime.getBackgroundPage()
    // and call its method does not work. While executing JavaScript in background from
    // popup window, chrome.permissions.request() does not work. It just fires its callback
    // without requesting any permissions.
    chrome.runtime.sendMessage(startMsg);

    await storeToStorage(config, cors);
}

chrome.runtime.onMessage.addListener(async (msg: Message) => {
    if (!msg.type.startsWith('popup:')) {
        return;
    }

    switch (msg.type) {
        case 'popup:content':
            await startMonolith(msg);
            break;
        case 'popup:complete':
            getButton.success();
            break;
        case 'popup:error':
            getButton.clear();
            errorMessage.show(msg.name || 'ERROR', msg.message);
            break;
        default:
            console.error('Unexpected message:', msg);
            break;
    }
});

async function setupConfigButtons() {
    let storage: Storage;
    try {
        storage = await loadFromStorage();
    } catch (err) {
        storage = DEFAULT_STORAGE;
    }

    const { config, cors } = storage;
    configButtons.noJs.set(!config.noJs);
    configButtons.noCss.set(!config.noCss);
    configButtons.noIFrames.set(!config.noIFrames);
    configButtons.noImages.set(!config.noImages);
    configButtons.allowCors.set(cors);
}

setupConfigButtons().catch(err => console.error('Could not set config buttons:', err));
