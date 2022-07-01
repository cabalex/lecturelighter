import { ArrowRight, ArrowUpward, Autorenew } from '@mui/icons-material';
import React from 'react';
import './VideoInitial.css';
import VideoHandler from '../../../handlers/VideoHandler';

function VideoInitial({videoHandler} : {videoHandler: VideoHandler}) {
    const [isFileLoading, setFileLoading] = React.useState(false);
    const [isUrlLoading, setUrlLoading] = React.useState(false);
    const textRef = React.useRef<HTMLInputElement>(null);
    const fileRef = React.useRef<HTMLInputElement>(null);

    function onFileChange(e:any) {
        if (videoHandler.playlist.length === 0) setFileLoading(true);

        for (let i = 0; i < e.target.files.length; i++) {
            let file = e.target.files[i];
            videoHandler.addVideo(URL.createObjectURL(file), file.name);
        }
        e.target.value = '';
    }

    function onUrlChange(e:any) {
        if (e.type === 'keyup' && e.keyCode !== 13) return;
        
        if (videoHandler.playlist.length === 0) setUrlLoading(true);
        
        if (textRef.current) {
            videoHandler.addVideo(textRef.current.value);
            textRef.current.value = '';   
        }
    }

    videoHandler.subscribe('loadeddata', () => {
        setFileLoading(false);
        setUrlLoading(false);
    })


    return (
        <div className="video-initial">
            <div className="btn" onClick={() => fileRef.current?.click()}>
                {isFileLoading ? <Autorenew className="loading" /> : <ArrowUpward />}
                <span>Upload a video</span>
            </div>
            <input multiple type="file" accept="video/*" onChange={onFileChange} ref={fileRef} />
            <span>or</span>
            <div className="input">
                <input type="text" placeholder="Paste a link" ref={textRef} onKeyUp={onUrlChange} />
                {isUrlLoading ? <Autorenew className="loading" /> : <ArrowRight className="input-submit" onClick={onUrlChange} />}
            </div>
        </div>
    );
}

export default VideoInitial;
