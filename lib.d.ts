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
type MessageToPopup = MessageMonolithContent | MessageDownloadComplete;

type Message = MessageToPopup;
