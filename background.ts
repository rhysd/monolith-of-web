import { monolithOfHtml, MonolithOptions } from 'monolith';
import sanitizeFileName from 'sanitize-filename';

function downloadURL(fileName: string, url: string) {
    // const a = document.createElement('a');
    // a.download = fileName;
    // a.href = url;
    // a.click();
    return new Promise<number>(resolve => {
        const opts = {
            url,
            filename: fileName,
            saveAs: false,
        };
        chrome.downloads.download(opts, resolve);
    });
}

function openURL(url: string) {
    return new Promise(resolve => {
        chrome.tabs.create({ url }, resolve);
    });
}

const downloading = new Map<number, string | null>();
async function download(msg: MessageDownloadMonolith) {
    const opts = MonolithOptions.new();
    const html = await monolithOfHtml(msg.html, msg.url, opts);
    const data = new Blob([html], { type: 'text/html' });
    const obj = URL.createObjectURL(data);
    try {
        const file = `${sanitizeFileName(msg.title) || 'index'}.html`;
        const id = await downloadURL(file, obj);
        downloading.set(id, null);
    } finally {
        URL.revokeObjectURL(obj);
    }
}

chrome.downloads.onChanged.addListener(async delta => {
    if (!downloading.has(delta.id)) {
        return;
    }
    if (delta.filename?.current) {
        downloading.set(delta.id, delta.filename.current);
        return;
    }
    const state = delta.state?.current;
    const filename = downloading.get(delta.id);
    switch (state) {
        case 'complete':
            if (filename) {
                await openURL('file://' + filename);
            }
            downloading.delete(delta.id);
            break;
        case 'interrupted':
            downloading.delete(delta.id);
            break;
    }
});

chrome.runtime.onMessage.addListener(async (msg: MessageToBackground) => {
    try {
        switch (msg.type) {
            case 'bg:download':
                await download(msg);
                break;
            default:
                if ((msg.type as string).startsWith('bg:')) {
                    console.error('FATAL: Unexpected message:', msg);
                }
                break;
        }
    } catch (err) {
        const msg: MessageToPopup = {
            type: 'popup:error',
            name: err.name,
            message: err.message,
        };
        chrome.runtime.sendMessage(msg);
        console.error('ERROR:', err);
    }
});
