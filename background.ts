import { monolithOfHtml, MonolithOptions } from 'monolith';
import sanitizeFileName from 'sanitize-filename';

declare global {
    interface Window {
        wasmLoadedInBackground?: boolean;
    }
}

const ANY_ORIGIN_PERMISSIONS = { permissions: [], origins: ['http://*/*', 'https://*/*'] };

function downloadURL(fileName: string, url: string) {
    const a = document.createElement('a');
    a.download = fileName;
    a.href = url;
    a.click();
}

function requestAnyOriginAccess() {
    return new Promise<boolean>(resolve => {
        chrome.permissions.request(ANY_ORIGIN_PERMISSIONS, resolve);
    });
}

function revokeAnyOriginAccess() {
    return new Promise<boolean>(resolve => {
        chrome.permissions.remove(ANY_ORIGIN_PERMISSIONS, resolve);
    });
}

async function download(params: MonolithParams) {
    const granted = params.cors && (await requestAnyOriginAccess());
    console.log('Permissions for CORS request granted:', granted);

    const c = params.config;
    console.log('Start monolith for', params.url, 'with', c);

    const opts = MonolithOptions.new();
    if (c.noJs) {
        opts.noJs(true);
    }
    if (c.noCss) {
        opts.noCss(true);
    }
    if (c.noIFrames) {
        opts.noFrames(true);
    }
    if (c.noImages) {
        opts.noImages(true);
    }

    const html = await monolithOfHtml(params.html, params.url, opts);
    const data = new Blob([html], { type: 'text/html' });
    const obj = URL.createObjectURL(data);

    try {
        const file = `${sanitizeFileName(params.title) || 'index'}.html`;
        downloadURL(file, obj);
    } finally {
        URL.revokeObjectURL(obj);
        if (granted) {
            const revoked = await revokeAnyOriginAccess();
            console.log('Permissions for CORS request revoked:', revoked);
        }
    }
}

chrome.runtime.onMessage.addListener(async (msg: Message) => {
    switch (msg.type) {
        case 'bg:start':
            try {
                await download(msg.params);
                chrome.runtime.sendMessage({ type: 'popup:complete' });
            } catch (err) {
                chrome.runtime.sendMessage({
                    type: 'popup:error',
                    name: err.name || 'Error',
                    message: err.message,
                });
            }
            break;
        default:
            break;
    }
});

window.wasmLoadedInBackground = true;
