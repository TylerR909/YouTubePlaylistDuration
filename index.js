let timeElement;
let timeCalcEvent;

function main() {
    createElements();
    console.log('Starting YPD event');
    timeCalcEvent = setInterval(calculateTime, 2000);
}

function createElements() {
    if (! document.getElementById('timeElement')) {
        const statsBlock = document.getElementById('stats');
        timeElement = document.createElement('yt-formatted-string');
        timeElement.id = 'timeElement';
        statsBlock.appendChild(timeElement);
        timeElement.classList = 'style-scope ytd-playlist-sidebar-primary-info-renderer';
    }
}

function calculateTime() {
    const contents = document.getElementById('contents');
    const times = contents.getElementsByClassName('ytd-thumbnail-overlay-time-status-renderer');

    let newTime = 0;

    Array.prototype.forEach.call(times, item => {
        newTime += getSecondsFromTimestamp(item.innerText);
    });

    renderTimeFromSeconds(newTime);

    if (times.length >= 100) {
        timeElement.innerText += '+';
        timeElement.title = "100+ items in list. Time may not be accurate.";
    } 
}

function getSecondsFromTimestamp(timestamp) {
    let [sec=0, min=0, hr=0] = timestamp.split(':').reverse();
    sec = Number(sec);
    sec += min * 60;
    sec += hr * 60 * 60;
    return sec;
}

function renderTimeFromSeconds(totalSeconds) {
    const sec = totalSeconds % 60;
    const min = Math.floor((totalSeconds/60) % 60);
    const hr = Math.floor(totalSeconds/60/60);

    let timeStr = `${sec}s`;
    if (min || hr) {
        timeStr = `${min}m ${timeStr}`
    }
    if (hr) {
        timeStr = `${hr}h ${timeStr}`
    }
    timeElement.innerText = timeStr;
}

function removeElements() {
    if (timeElement) {
        timeElement.parentNode.removeChild(timeElement);
    }
    stopEvent();
}

function stopEvent() {
    if (timeCalcEvent) {
        console.log('Stopping YPD event');
        clearInterval(timeCalcEvent);
        timeCalcEvent = null;
    }
}

window.addEventListener('load', main);
window.addEventListener('yt-page-data-updated', main);
window.addEventListener('yt-navigate-start', removeElements);