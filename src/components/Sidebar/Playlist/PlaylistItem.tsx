import React from 'react';
import './Playlist.css';
import VideoHandler, { VideoPlaylistInstance } from '../../../handlers/VideoHandler';
import { Autorenew, Close, Error, Link } from '@mui/icons-material';
import { secondsToTime } from '../../Video/VideoControls/VideoControls';

function PlaylistItem({videoHandler, video, index} : {videoHandler: VideoHandler, video: VideoPlaylistInstance, index: number}) {
    let [isError, setIsError] = React.useState<boolean|null>(null);

    videoHandler.subscribe('loaderror', (i: number) => {
        if (i === index) setIsError(true);
    })

    videoHandler.subscribe('loadedplaylistskipregions', (i: number) => {
        if (i === index) setIsError(false);
    })

    let realDuration = videoHandler.playlist[index].duration;
    let trimmedDuration = videoHandler.calculateTrimmedDuration(index);
    
    return (
    <div
        className={videoHandler.playlistIndex === index ? "playlist-item playing" : "playlist-item"}
        onClick={() => videoHandler.load(index)}
    >
        <div className="thumb">
            <video height="100%" src={video.duration ? `${video.src}#t=${video.duration / 4}` : ''} />
            {isError === true && <Error />}
            {isError === null && <Autorenew />}
        </div>
        
        <div className="playlist-item-body">
            <h2 title={video.title}>{video.title}</h2>
            <div className="btnrow">
                <div
                    className="btn"
                    title="Remove video"
                    onClick={(e) => {videoHandler.removePlaylistItem(index); e.stopPropagation()}}
                >
                    <Close />
                </div>
                <div
                    className="btn borderBtn"
                    title="Copy link"
                    onClick={(e) => {
                        navigator.clipboard.writeText(videoHandler.playlist[index].src);
                        e.stopPropagation();
                    }}>
                    <Link />
                </div>
                {realDuration > 0 && <span><span className="strikethrough">{secondsToTime(realDuration)}</span> <b>{secondsToTime(trimmedDuration)}</b> ({Math.round(-100 + trimmedDuration / realDuration * 100)}%) </span>}
            </div>
        </div>
    </div>
    );
}

export default PlaylistItem;
