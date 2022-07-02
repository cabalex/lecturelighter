import { Close, PlayArrow, FastForward, Equalizer } from "@mui/icons-material";
import * as React from "react";
import "./HelpModal.css";

function HelpModal({shown, hideHelpModal} : {shown: boolean, hideHelpModal: any}) {
    return (
    <div className="modal" onClick={hideHelpModal} style={{display: shown ? 'block' : 'none'}}>
        <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h1>What is LectureLighter?</h1>
                <Close onClick={hideHelpModal} />
            </div>
            <p>
                LectureLighter makes it easier to watch long lectures by speeding up the less important silent parts.<br />
                For example, if the speaker is writing something down instead of talking, LectureLighter automatically fast-forwards through it.<br />
                You can upload multiple videos to the app for easier viewing.
            </p>
            <p>LectureLighter has three parameters you can set:</p>
            <p className="flex">
                <PlayArrow />
                <span><b>Normal speed</b> - Speed when sound is detected. You can set this between 0.25x and "instant", meaning audible parts will be skipped over. <i>You probably don't want to skip over the talking parts on lectures unless you don't want to learn anything :)</i></span>
            </p>
            <p className="flex">
                <FastForward />
                <span><b>Skip speed</b> - Speed when no sound is detected. You can set this between 0.25x and "instant", meaning silent parts will be completely skipped over.</span>
            </p>
            <p className="flex">
                <Equalizer />
                <span><b>Audio sensitivity</b> - How sensitive the app is to audio, ranging from "Hyperdeaf" (almost all is detected as silence) to "Hypersensitive" (almost all is detected as noise). The noise detection is relative, meaning that it is in relation to the loudest part of the video.</span>    
            </p> 
            <h2>How does it work?</h2>
            <p><b>TL;DR: LectureLighter decodes the video's audio and parses it to find the silent parts. Then, it applies this to the video playback.</b></p>
            <p>
                LectureListener relies on the browser's <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API">Web Audio API</a>.
                When a video is loaded, the app also pushes the video data through an <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext">AudioContext</a> to decode the audio data into raw PCM data.
                This data is then parsed to find silent chunks by averaging the loudness value of each chunk. If this value is above a certain threshold, it is considered silent.
                Additional filtering is also done to make sure super-short silent parts are not considered (as this can get annoying!).
            </p>
            <h2>FAQ</h2>
            <b>Why isn't this working on iOS?</b>
            <p>iOS is very finnicky about how video players work, and I haven't been able to find a stable solution yet. I'm working on it, though!</p>
            <b>An exclamation point appeared next to my video and it won't play.</b>
            <p>This means that the app either failed to load your video or could not decode its audio. This usually means it is incompatible, and you'll need to try another file or convert it using an external tool.</p>
            <h2>About</h2>
            <p>
                LectureLighter was created by <a href="https://cabalex.github.io">@cabalex</a> and built in React. You can <a href="https://github.com/cabalex/lecturelighter">view the source code here</a>.<br />
                Somewhat inspired by carykh's video <a href="https://www.youtube.com/watch?v=DQ8orIurGxw">Automatic on-the-fly video editing tool</a>
            </p>

        </div>
    </div>
    )
}

export default HelpModal;