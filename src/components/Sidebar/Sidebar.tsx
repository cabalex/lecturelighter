import React from 'react';
import './Sidebar.css';
import VideoHandler from '../../handlers/VideoHandler';
import Header from './Header/Header';
import Playlist from './Playlist/Playlist';

function Sidebar({videoHandler, showHelpModal} : {videoHandler: VideoHandler, showHelpModal: any}) {
    return (
        <div className="sidebar">
            <Header videoHandler={videoHandler} showHelpModal={showHelpModal} />
            <Playlist videoHandler={videoHandler} />
            <footer><a href="https://github.com/cabalex/lecturelighter">lecturelighter v1</a> - <a href="https://cabalex.github.io">Made with pain by @cabalex</a></footer>
        </div>
    );
}

export default Sidebar;
