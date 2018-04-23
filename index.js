let timeElement; 
let time = 0;
let timeCalcEvent;
let timeCalcCounter = 0;

function main() {
    createElements();
    timeCalcEvent = setInterval(function() {
        time = 0;
        calculateTimes();

        if (++timeCalcCounter > 20) {
            clearTimeEvent();
        }
    }, 500);
}

function createElements() {
    const statsBlock = document.getElementById('stats');
    timeElement = document.createElement('yt-formatted-string');
    timeElement.id = 'timeElement';
    timeElement.classList = 'style-scope ytd-playlist-sidebar-primary-info-renderer';
    statsBlock.appendChild(timeElement);
    timeElement.innerText = 0;
}

function calculateTimes() {
    const contents = document.getElementById('contents');
    const times = contents.getElementsByClassName('ytd-thumbnail-overlay-time-status-renderer')

    Array.prototype.forEach.call(times, function(item) {
        const elementTime = item.innerText;
        addTime(elementTime);
        renderTimeFromSeconds();
    });

    if (times.length >= 100) {
        timeElement.innerText += '+';
        timeElement.title = "100+ items in list. Time may not be accurate.";
    }
}

function addTime(timeToAdd) {
    const timeArray = timeToAdd.split(':').reverse();
    for (let i = 0; i < timeArray.length; i++) {
        time += Number(timeArray[i]) * Math.pow(60, i);
    }
}

function renderTimeFromSeconds() {
    const renderedTime = new Date(null);
    renderedTime.setSeconds(time);
    timeElement.innerText = renderedTime.toISOString().substr(11,8);
}

function removeElements() {
    timeElement.parentNode.removeChild(timeElement);
    clearTimeEvent();
}

function clearTimeEvent() {
    if (timeCalcEvent) {
        clearInterval(timeCalcEvent)
        timeCalcEvent = null;
    }
}

window.addEventListener('load', function(event) { setTimeout(main, 2000); });
window.addEventListener('yt-page-data-updated',function(event) { setTimeout(main, 2000); });
window.addEventListener('yt-navigate-start', removeElements);
