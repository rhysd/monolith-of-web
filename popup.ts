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
    showError('Hi!', 'Hello, world!');
});
