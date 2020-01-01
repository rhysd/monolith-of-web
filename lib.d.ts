interface Config {
    noJs: boolean;
    noCss: boolean;
    noIFrames: boolean;
    noImages: boolean;
}

type MessageDownloadMonolith = {
    type: 'bg:start';
    html: string;
    title: string;
    url: string;
    config: Config;
};
type MessageToBackground = MessageDownloadMonolith;

type MessageMonolithContent = {
    type: 'popup:content';
    html: string;
    title: string;
    url: string;
};
type MessageErrorHappened = {
    type: 'popup:error';
    name: string | undefined;
    message: string;
};
type MessageDownloadComplete = {
    type: 'popup:complete';
};
type MessageToPopup = MessageMonolithContent | MessageErrorHappened | MessageDownloadComplete;

type Message = MessageToBackground | MessageToPopup;
