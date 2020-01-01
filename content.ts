const html = '<!DOCTYPE html>' + document.documentElement.outerHTML;
const url = location.href;
const title = document.title;
const msg: MessageToPopup = {
    type: 'popup:content',
    html,
    title,
    url,
};
chrome.runtime.sendMessage(msg);
