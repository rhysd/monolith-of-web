interface Config {
    noJs: boolean;
    noCss: boolean;
    noIFrames: boolean;
    noImages: boolean;
}

interface MonolithParams {
    html: string;
    title: string;
    url: string;
    cors: boolean;
    config: Config;
}

type MessageMonolithContent = {
    type: 'popup:content';
    html: string;
    title: string;
    url: string;
};
type MessageDownloadComplete = {
    type: 'popup:complete';
};
type MessageDownloadError = {
    type: 'popup:error';
    name: string;
    message: string;
};
type MessageToPopup = MessageMonolithContent | MessageDownloadComplete | MessageDownloadError;

type MessageCreateMonolith = {
    type: 'bg:start';
    params: MonolithParams;
};
type MessageToBackground = MessageCreateMonolith;

type Message = MessageToPopup | MessageToBackground;
