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

if (window.location.href.includes("instructuremedia")) {
    interval = setInterval(canvasPlayerHook, 100);
} else if (window.location.href.includes("zoom.us/rec/play/")) {
    interval = setInterval(zoomPlayerHook, 100);
}