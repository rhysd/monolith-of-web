import { monolithOfHtml, MonolithOptions } from 'monolith';
import sanitizeFileName from 'sanitize-filename';

function downloadURL(fileName: string, url: string) {
    const a = document.createElement('a');
    a.download = fileName;
    a.href = url;
    a.click();
}

async function download(msg: MessageDownloadMonolith) {
    const opts = MonolithOptions.new();
    const html = await monolithOfHtml(msg.html, msg.url, opts);
    const data = new Blob([html], { type: 'text/html' });
    const obj = URL.createObjectURL(data);
    try {
        const file = `${sanitizeFileName(msg.title) || 'index'}.html`;
        downloadURL(file, obj);
    } finally {
        URL.revokeObjectURL(obj);
    }
    throw new Error('Hello!');
}

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
