import React from 'react';
import './Header.css';
import VideoHandler from '../../../handlers/VideoHandler';
import { Close, Equalizer, FastForward, OpenInFull, PlayArrow } from '@mui/icons-material';
import DropdownBtn from '../../DropdownBtn/DropdownBtn';

const speeds = [
    {name: "0.25x", value: 0.25},
    {name: "0.5x", value: 0.5},
    {name: "0.75x", value: 0.75},
    {name: "Normal", value: 1},
    {name: "1.25x", value: 1.25},
    {name: "1.5x", value: 1.5},
    {name: "2x", value: 2},
    {name: "3x", value: 3},
    {name: "5x", value: 5},
    {name: "Skip over", value: -1}
]

const thresholds = [
    {name: 'Hypersensitive', value: 0.1},
    {name: 'Sensitive', value: 0.2},
    {name: 'Balanced', value: 0.3},
    {name: 'Deaf', value: 0.5},
    {name: 'Hyperdeaf', value: 0.75},
]

function Header({videoHandler, showHelpModal, isMobileHidden, setIsMobileHidden} : {videoHandler: VideoHandler, showHelpModal: any, isMobileHidden: boolean, setIsMobileHidden: any}) {
    const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;

    const destroy = () => {
        if (videoHandler.playlist.length === 1 || window.confirm('Are you sure you want to delete ALL videos?\nHint: If you just want to delete this video, click the X next to it in the playlist.')) {
            videoHandler.destroy();
        }
    }
    

    videoHandler.subscribe('loadeddata', forceUpdate);
    videoHandler.subscribe('playlistremove', forceUpdate);
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
                <DropdownBtn
                    className="btn borderBtn"
                    options={speeds}
                    title="Change normal speed (the speed of audible parts)."
                    value={videoHandler.normalSpeed}
                    onSelect={(speed) => { videoHandler.setNormalSpeed(speed); forceUpdate()}}
                >
                    <PlayArrow  />
                    <span>{videoHandler.normalSpeed === -1 ? 'Skip over' : `${videoHandler.normalSpeed}x Speed`}</span>
                </DropdownBtn>
                <DropdownBtn
                    className="btn borderBtn"
                    options={speeds}
                    title="Change skip speed (the speed of silent parts)."
                    value={videoHandler.skipSpeed}
                    onSelect={(speed) => { videoHandler.setSkipSpeed(speed); forceUpdate()}}
                >
                    <FastForward  />
                    <span>{videoHandler.skipSpeed === -1 ? 'Skip over' : `${videoHandler.skipSpeed}x Speed`}</span>
                </DropdownBtn>
                <DropdownBtn
                    className="btn borderBtn"
                    options={thresholds}
                    title="Change skip speed (the speed of silent parts)."
                    value={videoHandler.audioThreshold}
                    onSelect={(threshold) => { videoHandler.setAudioThreshold(threshold); forceUpdate()}}
                >
                    <Equalizer />
                    <span>{thresholds.filter(x => x.value === videoHandler.audioThreshold)[0].name}</span>
                </DropdownBtn>
            </div>
        </header>
    );
}

export default Header;
