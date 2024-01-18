let interval;
function canvasPlayerHook() {
    let menu = document.getElementsByClassName('css-1v3tle5-player-control-container')[0];
    let title = document.head.querySelector("[property='og:title'][content]").content;
    if (!menu) return;

    clearInterval(interval);

    let video = document.getElementsByTagName('source')[0];

    document.body.style.overflow = "hidden";

    let element = document.createElement('div');
    element.className = 'css-osw6zp-button';
    element.title = "Open in LectureLighter"
    element.innerHTML = '<img alt="LL" src="https://cabalex.github.io/lecturelighter/logo192.png" style="height: 80%;">'
    element.onclick = () => {
        chrome.runtime.sendMessage({type: 'OPEN_VIDEO', url: video.src, title})
    }
    let menuElems = menu.getElementsByClassName('css-18cbc18-buttonWrapper')
    menu.insertBefore(element, menuElems[menuElems.length - 1]);
}

function yujaPlayerHook() {
    let menu = document.getElementsByClassName('player-mainbar')[0];
    let video = document.getElementById('hls-stream0');
    if (!menu || !video) return;

    clearInterval(interval);

    function pauseAllMedia() {
        // pause all videos
        let videos = document.getElementsByTagName('video');
        for (let i = 0; i < videos.length; i++) {
            videos[i].pause();
        }
        let audio = document.getElementsByTagName('audio');
        for (let i = 0; i < audio.length; i++) {
            audio[i].pause();
        }
    }

    let v = document.location.href.split("v=")[1].split("&")[0];
    let node = document.location.href.split("node=")[1].split("&")[0];
    let a = document.location.href.split("a=")[1].split("&")[0];
    fetch("/P/Data/VideoJSON", {
        headers: {
            cookie: document.cookie,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: `video=${v}&a=${a}&getPlayerType=true&node=${node}&list=-1&singlePass=&useTrackingUserPID=false&domain=${document.location.host}&sourceIdCode=vmciolvd&cim=false&noCache=false`,
        method: "POST"
    }).then(res => res.json()).then(json => {
        if (json.video.videoLinkMp4) {
            let element = document.createElement('div');
            element.className = 'player-icon-class focusable';
            element.title = "Open in LectureLighter"
            element.style = "height: unset"
            element.innerHTML = '<img alt="LL" src="https://cabalex.github.io/lecturelighter/logo192.png" style="width: 32px; cursor: pointer;">'
            element.onclick = () => {
                pauseAllMedia();
                element.style = "height: unset; cursor: wait;";
                chrome.runtime.sendMessage({type: 'OPEN_VIDEO', url: json.video.videoLinkMp4, title: json.video.videoTitle});
            }
            let menuElems = document.getElementById('commentWrapper');
            menu.insertBefore(element, menuElems);
            return;
        }
        // MULTIPLE STREAMS - have to do more digging...
        fetch(`/P/Data/VideoSource?video=${encodeURIComponent(json.video.videoLink)}&videoPID=${v}&videoListNodePID=${node}&mp4Only=true&includeThumbnails=false&contentToken=${json.contentToken}`, { headers: { cookie: document.cookie }}).then(res => res.json()).then(newJson => {
            let streams = newJson.streams.filter(s => s.typeAndVideoSourceMap.MP4);
            let audio = newJson.streams.filter(s => s.typeAndVideoSourceMap.AUDIO);
            console.log(streams);

            for (let i = 0; i < streams.length; i++) {
                let element = document.createElement('div');
                element.className = 'player-icon-class focusable';
                element.title = `Open display ${i + 1} in LectureLighter`
                element.style = "height: unset; position: relative;"
                element.innerHTML = `<img alt="LL" src="https://cabalex.github.io/lecturelighter/logo192.png" style="width: 32px; cursor: pointer;"><span style="position: absolute; right: 5px; bottom: 0; color: white">${i + 1}</span>`
                element.onclick = () => {
                    pauseAllMedia();
                    element.style = "height: unset; cursor: wait;";
                    chrome.runtime.sendMessage({type: 'OPEN_VIDEO', url: streams[i].typeAndVideoSourceMap.MP4.fileURL, audio: audio[0]?.typeAndVideoSourceMap.AUDIO.fileURL, title: json.video.videoTitle});
                }
                let menuElems = document.getElementById('commentWrapper');
                menu.insertBefore(element, menuElems);
            }
        })
    })
}

function zoomPlayerHook() {
    let menu = document.getElementsByClassName('zm-col-8')[0];
    let title = document.head.getElementsByTagName("title")[0].textContent;
    if (!menu) return;

    menu.style.display = "flex";
    menu.style.justifyContent = "flex-end";
    menu.style.gap = "10px";
    menu.style.alignItems = "center";

    clearInterval(interval);

    let video = document.getElementsByTagName('video')[0];

    let element = document.createElement('div');
    element.className = 'download';
    element.title = "Open in LectureLighter"
    element.style.cursor = "pointer";
    element.innerHTML = '<img alt="LL" src="https://cabalex.github.io/lecturelighter/logo192.png" style="height: 50px;">'
    element.onclick = () => {
        chrome.runtime.sendMessage({type: 'OPEN_VIDEO', url: video.src, title, cookie: document.cookie, referrer: document.referrer || window.location.origin})
    }
    let menuElems = menu.getElementsByClassName('css-18cbc18-buttonWrapper')
    menu.insertBefore(element, menuElems[menuElems.length - 1]);
}

let yujaIcon = document.head.querySelector("[rel='shortcut icon'][href]");
if (window.location.href.includes("instructuremedia")) {
    interval = setInterval(canvasPlayerHook, 100);
} else if (window.location.href.includes("zoom.us/rec/play/")) {
    interval = setInterval(zoomPlayerHook, 100);
} else if (yujaIcon && yujaIcon.href.includes("yuja.com")) {
    interval = setInterval(yujaPlayerHook, 100);
}