import { monolithOfHtml, MonolithOptions } from 'monolith';
import sanitizeFileName from 'sanitize-filename';

function downloadURL(fileName: string, url: string) {
    const a = document.createElement('a');
    a.download = fileName;
    a.href = url;
    a.click();
}

async function download(msg: MessageDownloadMonolith) {
    const c = msg.config;
    console.log('Start monolith for', msg.url, 'with', c);

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

    const html = await monolithOfHtml(msg.html, msg.url, opts);
    const data = new Blob([html], { type: 'text/html' });
    const obj = URL.createObjectURL(data);

    try {
        const file = `${sanitizeFileName(msg.title) || 'index'}.html`;
        downloadURL(file, obj);
        const complete: MessageDownloadComplete = {
            type: 'popup:complete',
        };
        chrome.runtime.sendMessage(complete);
    } finally {
        URL.revokeObjectURL(obj);
    }
}

chrome.runtime.onMessage.addListener(async (msg: Message) => {
    try {
        switch (msg.type) {
            case 'bg:start':
                await download(msg);
                break;
            default:
                if (msg.type.startsWith('bg:')) {
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
