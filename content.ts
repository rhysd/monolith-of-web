const html = '<!DOCTYPE html>' + document.documentElement.outerHTML;
const url = location.href;
const title = document.title;
const msg: MessageToBackground = {
    type: 'bg:download',
    html,
    title,
    url,
};
chrome.runtime.sendMessage(msg);
