import React from 'react';
import './Header.css';
import VideoHandler from '../../../handlers/VideoHandler';
import { Close, FastForward, PlayArrow, QuestionMark } from '@mui/icons-material';
import { secondsToTime } from '../../Video/VideoControls/VideoControls';

function Header({videoHandler, showHelpModal} : {videoHandler: VideoHandler, showHelpModal: any}) {
    const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;

    const changeNormalSpeed = () => {
        let speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 5];
        let index = speeds.indexOf(videoHandler.normalSpeed) || 0;
        let nextIndex = (index + 1) % speeds.length;
        videoHandler.normalSpeed = speeds[nextIndex];
        forceUpdate();
    }

    const changeSkipSpeed = () => {
        let speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 5, -1];
        let index = speeds.indexOf(videoHandler.skipSpeed) || 0;
        let nextIndex = (index + 1) % speeds.length;
        videoHandler.skipSpeed = speeds[nextIndex];
        forceUpdate();
    }

    

    videoHandler.subscribe('loadeddata', forceUpdate);
    videoHandler.subscribe('destroyed', forceUpdate);
    videoHandler.subscribe('loadedskipregions', forceUpdate);

    return (
        <header>
            <h1>LectureLighter</h1>

            {videoHandler.isLoaded() ?
                <p>Trimmed time: <b>{secondsToTime(videoHandler.calculateTrimmedDuration())}</b></p> :
                <p>Make lectures easier to watch</p>}
            
            <div className="btnrow">
                {videoHandler.isLoaded() &&
                    (<div className="btn" onClick={() => videoHandler.destroy()}>
                        <Close  />
                    </div>)
                }
                <div
                    className="btn borderBtn"
                    onClick={() => changeNormalSpeed()}
                >
                    <PlayArrow  />
                    <span>{videoHandler.normalSpeed}x Speed</span>
                </div>
                <div
                    className="btn borderBtn"
                    onClick={() => changeSkipSpeed()}
                    title="Change skip speed (the speed of silent parts)."
                >
                    <FastForward  />
                    <span>{videoHandler.skipSpeed === -1 ? 'Skip over' : `${videoHandler.skipSpeed}x Speed`}</span>
                </div>
                <div className="btn borderBtn" onClick={showHelpModal}>
                    <QuestionMark  />
                </div>
            </div>
        </header>
    );
}

export default Header;
