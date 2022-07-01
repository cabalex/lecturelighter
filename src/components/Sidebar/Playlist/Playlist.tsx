import React from 'react';
import './Playlist.css';
import VideoHandler from '../../../handlers/VideoHandler';
import { Add } from '@mui/icons-material';
import VideoInitial from '../../Video/VideoInitial/VideoInitial';
import PlaylistItem from './PlaylistItem';

function Playlist({videoHandler} : {videoHandler: VideoHandler}) {
    const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;

    videoHandler.subscribe('destroyed', forceUpdate);
    videoHandler.subscribe('loadeddata', forceUpdate);
    videoHandler.subscribe('loadedskipregions', forceUpdate);
    videoHandler.subscribe('playlistadd', forceUpdate);
    videoHandler.subscribe('playlistremove', forceUpdate);
    videoHandler.subscribe('playlistchange', forceUpdate);

    return (
        <div className="playlist">
            <div className="playlist-initial">{videoHandler.playlist.length} videos</div>
            {videoHandler.playlist.map((video, i) => (
                <PlaylistItem videoHandler={videoHandler} key={i} index={i} video={video} />
            ))}
            <div className="playlist-item add-video">
                <Add />
                <VideoInitial videoHandler={videoHandler} />
            </div>
        </div>
    );
}

export default Playlist;
