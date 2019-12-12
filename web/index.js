import { monolithOfUrl, MonolithOptions } from 'monolith';

const urlInput = document.getElementById('target-url');
const getMonolithButton = document.getElementById('get-monolith-btn');
const errorMessage = document.getElementById('error-message');
const closeErrorMessage = document.getElementById('close-error-message');
const errorSummary = document.getElementById('error-message-summary');
const errorBody = document.getElementById('error-message-body');

closeErrorMessage.addEventListener('click', () => {
    errorMessage.style.display = '';
});

function showErrorMessage(summary, body) {
    errorSummary.innerText = summary;
    errorBody.innerText = body;
    errorMessage.style.display = 'block';
}

getMonolithButton.addEventListener('click', async () => {
    const url = urlInput.value;
    if (url === '') {
        showErrorMessage('Invalid URL', 'URL input is empty. Please input valid URL');
        return;
    }

    try {
        const html = await monolithOfUrl(url, MonolithOptions.new());
        const blob = new Blob([html], { type: 'text/html' });
        const obj = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = obj;
        a.download = 'TODO.html';
        a.click();
        URL.revokeObjectURL(obj);
    } catch (err) {
        console.error(err);
        showErrorMessage(err.name || 'Error', err.message);
    }
});
