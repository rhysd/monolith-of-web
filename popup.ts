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
        this.elem.addEventListener('click', cb);
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
        private container: HTMLElement,
        private title: HTMLElement,
        private body: HTMLElement,
        closeBtn: HTMLButtonElement,
    ) {
        this.close = this.close.bind(this);
        closeBtn.addEventListener('click', this.close);
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
    constructor(private elem: HTMLElement) {
        elem.addEventListener('click', this.toggle.bind(this));
    }

    toggle() {
        if (this.elem.classList.contains(COLOR_DISABLED)) {
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
};

getButton.onClick(() => {
    getButton.startLoading();
    chrome.tabs.executeScript({ file: 'content.js' });
});

function startMonolith(m: MessageMonolithContent) {
    const config = {
        noJs: !configButtons.noJs.enabled(),
        noCss: !configButtons.noCss.enabled(),
        noIFrames: !configButtons.noIFrames.enabled(),
        noImages: !configButtons.noImages.enabled(),
    };
    const msg: MessageToBackground = {
        ...m,
        type: 'bg:start',
        config,
    };
    chrome.runtime.sendMessage(msg);
}

chrome.runtime.onMessage.addListener((msg: Message) => {
    switch (msg.type) {
        case 'popup:content':
            startMonolith(msg);
            break;
        case 'popup:error':
            getButton.clear();
            errorMessage.show(msg.name || 'ERROR', msg.message);
            break;
        case 'popup:complete':
            getButton.success();
            break;
        default:
            if (msg.type.startsWith('popup:')) {
                console.error('Unexpected message:', msg);
            }
            break;
    }
});
