import React from 'react';
import './Sidebar.css';
import VideoHandler from '../../handlers/VideoHandler';
import Header from './Header/Header';
import Playlist from './Playlist/Playlist';

function Sidebar({videoHandler, showHelpModal} : {videoHandler: VideoHandler, showHelpModal: any}) {
    let [isMobileHidden, setIsMobileHidden] = React.useState(false);
    
    return (
        <div className={isMobileHidden ? "sidebar hidden" : "sidebar"}>
            <Header videoHandler={videoHandler} showHelpModal={showHelpModal} isMobileHidden={isMobileHidden} setIsMobileHidden={setIsMobileHidden} />
            <Playlist videoHandler={videoHandler} />
            <footer><a href="https://github.com/cabalex/lecturelighter">lecturelighter v6</a> - <a href="https://cabalex.github.io">Made with pain by @cabalex</a></footer>
        </div>
    );
}

export default Sidebar;
