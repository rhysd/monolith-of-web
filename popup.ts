const errorMessage = document.getElementById('error-message') as HTMLElement;
const errorTitle = document.getElementById('error-title') as HTMLElement;
const errorCloseButton = document.getElementById('error-close') as HTMLButtonElement;
const errorBody = document.getElementById('error-body') as HTMLElement;
const getButton = document.getElementById('get-monolith-btn') as HTMLButtonElement;

errorCloseButton.addEventListener('click', () => {
    errorMessage.style.display = '';
});

function showError(title: string, body: string) {
    errorTitle.innerText = title;
    errorBody.innerText = body;
    errorMessage.style.display = 'block';
}

getButton.addEventListener('click', () => {
    chrome.tabs.executeScript({ file: 'content.js' });
});

chrome.runtime.onMessage.addListener((msg: MessageToPopup) => {
    switch (msg.type) {
        case 'popup:error':
            showError(msg.name || 'ERROR', msg.message);
            break;
        default:
            if ((msg.type as string).startsWith('popup:')) {
                console.error('FATAL: Unexpected message:', msg);
            }
            break;
    }
});
