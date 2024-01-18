import React from 'react';
import './Video.css';
import VideoInitial from './VideoInitial/VideoInitial';
import VideoHandler from '../../handlers/VideoHandler';
import VideoControls from './VideoControls/VideoControls';

function Video({videoHandler, setVideoElem, setAudioElem} : {videoHandler: VideoHandler, setVideoElem:any, setAudioElem:any}) {
    let videoRef = React.useRef<HTMLVideoElement>(null);
    let audioRef = React.useRef<HTMLAudioElement>(null);
    let outerRef = React.useRef<HTMLDivElement>(null);
    const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void


    React.useEffect(() => {
        setVideoElem(videoRef.current);
    }, [videoRef, setVideoElem])

    React.useEffect(() => {
        setAudioElem(audioRef.current);
    }, [audioRef, setAudioElem])

    videoHandler.subscribe('destroyed', forceUpdate);
    videoHandler.subscribe('playlistremove', forceUpdate);
    videoHandler.subscribe('loadeddata', forceUpdate);


    // NOTE TO SELF: DO NOT PUT VIDEO CONTROLS IN {} HERE! IT WILL BREAK RERENDERS FOR SOME REASON >:(
    return (
        <main>
            <div
                className="video-outer"
                ref={outerRef}
                style={
                    (videoHandler.isLoaded() && {
                        height: `calc(${window.innerWidth < 1000 ? '100vw' : '70vw'} * ${videoHandler.video.videoHeight / videoHandler.video.videoWidth})`,
                    }) || undefined
                }>
                {videoHandler.playlist.length === 0 && <VideoInitial videoHandler={videoHandler} />}
                <video ref={videoRef} autoPlay width="100%" height="100%" onClick={() => videoHandler.togglePlay()}>
                    <track kind="captions" />
                </video>
                <audio ref={audioRef} autoPlay style={{position: 'absolute', opacity: 0, pointerEvents: 'none'}} />
                <VideoControls outerRef={outerRef} videoHandler={videoHandler} />
            </div>
        </main>
    );
}

export default Video;
