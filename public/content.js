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
    element.innerHTML = '<img src="https://cabalex.github.io/lecturelighter/logo192.png" style="height: 80%;">'
    element.onclick = () => {
        chrome.runtime.sendMessage({type: 'OPEN_VIDEO', url: video.src, title})
    }
    let menuElems = menu.getElementsByClassName('css-18cbc18-buttonWrapper')
    menu.insertBefore(element, menuElems[menuElems.length - 1]);
}

if (window.location.href.includes("instructuremedia")) {
    interval = setInterval(canvasPlayerHook, 100);
}