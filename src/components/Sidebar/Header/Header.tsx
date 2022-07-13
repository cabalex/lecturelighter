import React from 'react';
import './Header.css';
import VideoHandler from '../../../handlers/VideoHandler';
import { Close, Equalizer, FastForward, OpenInFull, PlayArrow, QuestionMark } from '@mui/icons-material';
import { secondsToTime } from '../../Video/VideoControls/VideoControls';

function Header({videoHandler, showHelpModal, isMobileHidden, setIsMobileHidden} : {videoHandler: VideoHandler, showHelpModal: any, isMobileHidden: boolean, setIsMobileHidden: any}) {
    const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;

    const changeNormalSpeed = () => {
        let speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 5, -1];
        let index = speeds.indexOf(videoHandler.normalSpeed) || 0;
        let nextIndex = (index + 1) % speeds.length;
        videoHandler.setNormalSpeed(speeds[nextIndex]);
        forceUpdate();
    }

    const changeSkipSpeed = () => {
        let speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 5, -1];
        let index = speeds.indexOf(videoHandler.skipSpeed) || 0;
        let nextIndex = (index + 1) % speeds.length;
        videoHandler.setSkipSpeed(speeds[nextIndex]);
        forceUpdate();
    }

    const changeAudioThreshold = () => {
        let loudness = [0.1, 0.2, 0.3, 0.5, 0.75];
        let index = loudness.indexOf(videoHandler.audioThreshold) || 0;
        let nextIndex = (index + 1) % loudness.length;
        videoHandler.setAudioThreshold(loudness[nextIndex]);
        forceUpdate();
    }

    const thresholdLabels = new Map([
        [0.1, 'Hypersensitive'],
        [0.2, 'Sensitive'],
        [0.3, 'Balanced'],
        [0.5, 'Deaf'],
        [0.75, 'Hyperdeaf'],
    ])

    const destroy = () => {
        if (videoHandler.playlist.length === 1 || window.confirm('Are you sure you want to delete ALL videos?\nHint: If you just want to delete this video, click the X next to it in the playlist.')) {
            videoHandler.destroy();
        }
    }
    

    videoHandler.subscribe('loadeddata', forceUpdate);
    videoHandler.subscribe('destroyed', forceUpdate);
    videoHandler.subscribe('loadedskipregions', forceUpdate);

    return (
        <header>
            <h1 className="btn borderBtn" style={{fontSize: '2em', marginBlockStart: 0}} onClick={showHelpModal}>
                LectureLighter
            </h1>
            <div className="btn borderBtn mobile-toggle" onClick={() => setIsMobileHidden(!isMobileHidden)}>
                {isMobileHidden ? <OpenInFull /> : <Close />}
            </div>
            
            <div className="btnrow">
                {videoHandler.isLoaded() && videoHandler.playlist.length > 0 &&
                    (<div className="btn" onClick={destroy}>
                        <Close  />
                    </div>)
                }
                <div
                    className="btn borderBtn"
                    onClick={() => changeNormalSpeed()}
                >
                    <PlayArrow  />
                    <span>{videoHandler.normalSpeed === -1 ? 'Skip over' : `${videoHandler.normalSpeed}x Speed`}</span>
                </div>
                <div
                    className="btn borderBtn"
                    onClick={() => changeSkipSpeed()}
                    title="Change skip speed (the speed of silent parts)."
                >
                    <FastForward  />
                    <span>{videoHandler.skipSpeed === -1 ? 'Skip over' : `${videoHandler.skipSpeed}x Speed`}</span>
                </div>
                <div
                    className="btn borderBtn"
                    onClick={() => changeAudioThreshold()}
                    title="Change sensitivity for audio detection."
                >
                    <Equalizer />
                    <span>{thresholdLabels.get(videoHandler.audioThreshold)}</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
