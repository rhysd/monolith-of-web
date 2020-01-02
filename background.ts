import { monolithOfHtml, MonolithOptions } from 'monolith';
import sanitizeFileName from 'sanitize-filename';

declare global {
    interface Window {
        downloadMonolith(params: MonolithParams): Promise<void>;
    }
}

function downloadURL(fileName: string, url: string) {
    const a = document.createElement('a');
    a.download = fileName;
    a.href = url;
    a.click();
}

async function download(params: MonolithParams) {
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
        const complete: MessageDownloadComplete = {
            type: 'popup:complete',
        };
        chrome.runtime.sendMessage(complete);
    } finally {
        URL.revokeObjectURL(obj);
    }
}

window.downloadMonolith = download;
