import React from 'react';
import './Playlist.css';
import VideoHandler, { VideoPlaylistInstance } from '../../../handlers/VideoHandler';
import { ArrowDownward, ArrowUpward, Autorenew, Close, Error, Link } from '@mui/icons-material';
import { secondsToTime } from '../../Video/VideoControls/VideoControls';

function PlaylistItem({videoHandler, video, index} : {videoHandler: VideoHandler, video: VideoPlaylistInstance, index: number}) {
    let [isError, setIsError] = React.useState<boolean|null>(null);
    const titleRef = React.useRef<HTMLInputElement>(null);
    let [editingTitle, setEditingTitle] = React.useState<boolean|null>(null);

    let realDuration = videoHandler.playlist[index].duration;
    let trimmedDuration = videoHandler.calculateTrimmedDuration(index);

    videoHandler.subscribe('loaderror', (i: number) => {
        if (i === index) setIsError(true);
    })

    videoHandler.subscribe('loadedplaylistskipregions', (i: number) => {
        if (i === index) setIsError(false);
    })

    const retry = (e:any) => {
        e.stopPropagation();
        videoHandler.loadQueue.add(videoHandler.playlist[index]);
        videoHandler.loadQueue.priority(videoHandler.playlist[index]);
        setIsError(null);
    }

    const titleOuterClick = (e:any) => {
        if (titleRef.current && !titleRef.current.contains(e.target)) {
            setEditingTitle(false);
            videoHandler.playlist[index].title = titleRef.current.value;
        }
    }

    const onTitleChange = (e:any) => {
        if (e.keyCode === 13) {
            setEditingTitle(false);
            videoHandler.playlist[index].title = e.target.value;
        }
    }

    React.useEffect(() => {
        document.body.addEventListener('click', titleOuterClick);

        return () => {
            document.body.removeEventListener('click', titleOuterClick);
    }});

    if (video.duration && isError === null) {
        setIsError(false);
    }
    
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
            {!editingTitle && <h2
                title={video.title}
                onClick={(e) => {
                    setEditingTitle(true);
                    e.stopPropagation();
                    setTimeout(() => titleRef.current?.select(), 10);
                }}
                >{video.title}</h2>
            }
            <input
                type="text"
                className="title-input"
                ref={titleRef}
                style={{display: editingTitle ? 'block' : 'none'}}
                defaultValue={video.title}
                onClick={(e) => e.stopPropagation()}
                onKeyUp={onTitleChange} />
            <div className="btnrow">
                <div
                    className="btn"
                    title="Remove video"
                    onClick={(e) => {videoHandler.removePlaylistItem(index); e.stopPropagation()}}
                >
                    <Close />
                </div>
                {
                    isError === true && (<div
                        className="btn"
                        title="Retry loading"
                        onClick={retry}>
                            <Autorenew />
                    </div>)
                }
                <div
                    className="btn borderBtn"
                    title="Copy link"
                    onClick={(e) => {
                        navigator.clipboard.writeText(videoHandler.playlist[index].src);
                        e.stopPropagation();
                    }}>
                    <Link />
                </div>
                {index !== 0 && <div
                    className="btn borderBtn"
                    title="Move item down"
                    onClick={(e) => {
                        videoHandler.movePlaylistItem(index, index - 1);
                        e.stopPropagation();
                    }}>
                    <ArrowUpward />
                </div>}

                {index !== videoHandler.playlist.length - 1 && <div
                    className="btn borderBtn"
                    title="Move item up"
                    onClick={(e) => {
                        videoHandler.movePlaylistItem(index, index + 1);
                        e.stopPropagation();
                    }}>
                    <ArrowDownward />
                </div>}
                {realDuration > 0 && <span><span className="strikethrough">{secondsToTime(realDuration)}</span> <b>{secondsToTime(trimmedDuration)}</b> ({Math.round(-100 + trimmedDuration / realDuration * 100)}%) </span>}
            </div>
        </div>
    </div>
    );
}

export default PlaylistItem;
