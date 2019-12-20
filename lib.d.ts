type MessageDownloadMonolith = {
    type: 'bg:download';
    html: string;
    title: string;
    url: string;
};
type MessageToBackground = MessageDownloadMonolith;

type MessageErrorHappened = {
    type: 'popup:error';
    name: string | undefined;
    message: string;
};
type MessageDownloadComplete = {
    type: 'popup:complete';
};
type MessageToPopup = MessageErrorHappened | MessageDownloadComplete;

type Message = MessageToBackground | MessageToPopup;
