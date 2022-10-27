import React from 'react';
import './VideoControls.css';
import VideoHandler from '../../../handlers/VideoHandler';
import { Autorenew, FastForward, Fullscreen, Pause, PlayArrow, SkipNext, SkipPrevious } from '@mui/icons-material';

export function secondsToTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const seconds2 = Math.floor(seconds % 60).toString().padStart(2, '0');
    return hours > 0 ? `${hours}:${minutes}:${seconds2}` : `${minutes}:${seconds2}`;
}


function VideoControls({outerRef, videoHandler} : {outerRef: React.RefObject<HTMLDivElement>, videoHandler: VideoHandler}) {
    const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void
    const [seeking, setSeeking] = React.useState(false);
    const [visible, setVisible] = React.useState(true);

    videoHandler.subscribe('timeupdate', forceUpdate);
    videoHandler.subscribe('loadedskipregions', forceUpdate);
    videoHandler.subscribe('destroyed', forceUpdate);

    // mouse cursor events
    function handleMouseCursor(e: any, override=false) {
        if (seeking || override) {
            let bounding = e.target.getBoundingClientRect();
            let width = bounding.width;
            let x = width + bounding.x - (e.clientX || e.touches[0].x);
            videoHandler.video.currentTime = (width - x) / width * videoHandler.video.duration;
            e.stopPropagation();
            forceUpdate();
        }
    }
    
    function play() {
        videoHandler.togglePlay();
        forceUpdate();
    }

    function skipNext() {
        if (videoHandler.playlistIndex < videoHandler.playlist.length - 1) {
            videoHandler.load(videoHandler.playlistIndex + 1);
            forceUpdate();
        }
    }
    function skipPrev() {
        if (videoHandler.playlistIndex > 0) {
            videoHandler.load(videoHandler.playlistIndex - 1);
            forceUpdate();
        }
    }

    function fullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            outerRef.current?.requestFullscreen();
        }
    }
    
    function handleMouseIn() {
        setVisible(true);
    }
    function handleMouseOut() {
        setVisible(false);
    }
    
    React.useEffect(() => {
        let ref = outerRef.current;
        
        ref?.addEventListener('mouseenter', handleMouseIn);
        ref?.addEventListener('mouseleave', handleMouseOut);

        return () => {
            ref?.removeEventListener('mouseenter', handleMouseIn);
            ref?.removeEventListener('mouseleave', handleMouseOut);
        }
    }, [outerRef]);
    
    return (
        <div className={videoHandler.isLoaded() && visible ? "video-controls" : "video-controls hidden"}>
            <div
                className={videoHandler.playlistIndex === 0 ? "btn playBtn disabledBtn" : "btn playBtn"}
                onClick={skipPrev}
            >
                <SkipPrevious />
            </div>
            <div className="btn playBtn" onClick={play}>
                {videoHandler.video.paused ? <PlayArrow /> : <Pause />}
            </div>
            <div
                className={videoHandler.playlistIndex === videoHandler.playlist.length - 1 ? "btn playBtn disabledBtn" : "btn playBtn"}
                onClick={skipNext}
            >
                <SkipNext />
            </div>
            <div
                className="video-timeline"
                onMouseDown={(e) => {setSeeking(true); handleMouseCursor(e, true)}}
                onMouseMove={handleMouseCursor}
                onTouchMove={handleMouseCursor}
                onMouseOut={() => setSeeking(false)}
                onMouseUp={() => setSeeking(false)}
            >
                <div className="video-timestamp">
                    <span className="from-stamp">{secondsToTime(videoHandler.video.currentTime)}</span>
                    <span className="to-stamp">{secondsToTime(videoHandler.video.duration)}</span>
                    {videoHandler.video.playbackRate !== 1 && (
                        <React.Fragment>
                            <span className="from-stamp">({secondsToTime(videoHandler.video.currentTime / videoHandler.video.playbackRate)}</span>
                            <span className="to-stamp">{secondsToTime(videoHandler.video.duration / videoHandler.video.playbackRate)})</span>
                        </React.Fragment>
                    )}
                    {(videoHandler.video.playbackRate === videoHandler.skipSpeed && videoHandler.video.playbackRate !== videoHandler.normalSpeed) && <FastForward />}
                </div>
                {
                    videoHandler.skipRegions.map(({from, to} : {from:number, to:number}, index ) =>
                        <div
                            className="tl-event"
                            key={index}
                            style={{
                                width: `${(to - from) / videoHandler.video.duration * 100}%`,
                                left: `${from / videoHandler.video.duration * 100}%`
                            }} />
                    )
                }
                <div className="video-timeline-progress" style={{width: `${videoHandler.video.currentTime / videoHandler.video.duration * 100}%`}} />
            </div>
            <div className="btn fullscreenBtn" onClick={fullscreen}>
                <Fullscreen />
            </div>
            {<div className={videoHandler.isLoadingSkipRegions ? "popup" : "popup closed"}>
                <Autorenew className="loading" />
                Loading skip regions...
            </div>}
        </div>
    );
}

export default VideoControls;
