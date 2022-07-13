import React from 'react';
import './Playlist.css';
import VideoHandler from '../../../handlers/VideoHandler';
import VideoInitial from '../../Video/VideoInitial/VideoInitial';
import PlaylistItem from './PlaylistItem';
import { secondsToTime } from '../../Video/VideoControls/VideoControls';

function Playlist({videoHandler} : {videoHandler: VideoHandler}) {
    const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;

    videoHandler.subscribe('destroyed', forceUpdate);
    videoHandler.subscribe('loadeddata', forceUpdate);
    videoHandler.subscribe('loadedplaylistskipregions', forceUpdate);
    videoHandler.subscribe('playlistadd', forceUpdate);
    videoHandler.subscribe('playlistremove', forceUpdate);
    videoHandler.subscribe('playlistchange', forceUpdate);
    videoHandler.subscribe('speedchange', forceUpdate);
    videoHandler.subscribe('videoplay', forceUpdate);
    videoHandler.subscribe('videopause', forceUpdate);

    let count = videoHandler.playlist.length;
    let durations = videoHandler.playlist.map(a => a.duration);
    let realDuration = durations.length === 0 || durations.includes(0) ? 0 : videoHandler.playlist.map(a => a.duration).reduce((a, b) => a + b);
    let reducedDuration = videoHandler.calculatePlaylistDuration();

    let ETAend = new Date(Date.now() + videoHandler.calculateRemainingPlaylistDuration() * 1000).toLocaleTimeString();

    return (
        <div className="playlist">
            {count > 0 && <div className="playlist-initial">
                {count} {count === 1 ? 'video' : 'videos'} - {realDuration > 0 && <span className="strikethrough">{secondsToTime(realDuration)}</span>} <b>{secondsToTime(reducedDuration)}</b> long {realDuration > 0 && `(${Math.round(-100 + reducedDuration / realDuration * 100)}%)`} - {ETAend}</div>}
            {videoHandler.playlist.map((video, i) => (
                <PlaylistItem videoHandler={videoHandler} key={video.src + i} index={i} video={video} />
            ))}
            <div className="playlist-item add-video">
                <VideoInitial videoHandler={videoHandler} />
            </div>
        </div>
    );
}

export default Playlist;
