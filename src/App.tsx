import React from 'react';
import './App.css';
import HelpModal from './components/HelpModal/HelpModal';
import Sidebar from './components/Sidebar/Sidebar';
import Video from './components/Video/Video';
import VideoHandler from './handlers/VideoHandler';

function App() {
    const [videoElem, setVideoElem] = React.useState<HTMLVideoElement | null>(null);
    const [audioElem, setAudioElem] = React.useState<HTMLAudioElement | null>(null);
    const [videoHandler, setVideoHandler] = React.useState<VideoHandler>(new VideoHandler());
    const [helpModalOpen, setHelpModalOpen] = React.useState(false);

    React.useEffect(() => {
        if (videoElem && audioElem) setVideoHandler(new VideoHandler(videoElem, audioElem));
    }, [videoElem, audioElem])

    const keyDown = React.useCallback((e:any) => {
        switch(e.keyCode) {
            case 32:
                // space - play/pause
                videoHandler.togglePlay();
                break;
            case 37:
                // left arrow - seek backward
                videoHandler.video.currentTime = Math.max(0, videoHandler.video.currentTime - 5);
                break;
            case 39:
                // right arrow - seek forward
                videoHandler.video.currentTime = Math.min(videoHandler.video.duration, videoHandler.video.currentTime + 5);
                break;
            case 78:
                // n - next video
                videoHandler.nextVideo();
                break;
            case 80:
                // p - previous video
                videoHandler.previousVideo();
                break;
        }
    }, [videoHandler]);

    // Keyboard shortcuts
    React.useEffect(() => {
        document.addEventListener('keydown', keyDown, false)

        return () => document.removeEventListener('keydown', keyDown);
    })

    return (
        <div className="App">
            <Video videoHandler={videoHandler} setVideoElem={setVideoElem} setAudioElem={setAudioElem} />
            <Sidebar videoHandler={videoHandler} showHelpModal={() => setHelpModalOpen(true)} />
            <HelpModal shown={helpModalOpen} hideHelpModal={() => setHelpModalOpen(false)} />
        </div>
    );
}

export default App;
