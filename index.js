(function () {

/** Main Interface */
class PlaylistDuration {
    constructor() {
        PlaylistDuration.cleanup()

        const statsBlock = document.getElementById('stats')
        this.element = document.createElement('yt-formatted-string')
        this.element.id =  'YPDTimeElement'
        this.element.classList = 'style-scope ytd-playlist-sidebar-primary-info-renderer'
        statsBlock.appendChild(this.element)
        this.locked = false

        this.lib = {
            getSecondsFromTimestamp: (timestamp) => {
                let [sec=0, min=0, hr=0] = timestamp.split(':').reverse()
                sec = Number(sec)
                sec += min * 60
                sec += hr * 60 * 60
                return sec
            },
            getTimestampFromSeconds: (totalSeconds) => {
                const sec = totalSeconds % 60
                const min = Math.floor((totalSeconds/60) % 60)
                const hr = Math.floor(totalSeconds/60/60)

                let timeStr = `${sec}s`
                if (min || hr) { timeStr = `${min}m ${timeStr}` }
                if (hr) { timeStr = `${hr}h ${timeStr}` }
                return timeStr
            },
            getPlaylistVideoCount: () => {
                const stats = document.getElementById('stats')

                // Return a string like '42 videos'
                const videoCountString = Array.from(stats.children)
                    .find(item => item.innerText.toLowerCase().includes('video'))
                    .innerText
                
                /**
                 * Match to digits, pull from the fullest match,
                 * cast to Number, and if there's a problem, default to 0
                 */
                return Number(
                    videoCountString
                    .match(/\d+/g)
                    [0]
                ) || 0
            },
            getLoadedVideoCount: () => {
                const videos = document.getElementsByTagName('ytd-playlist-video-renderer')
                return videos.length || 0
            }
        }
    }

    refresh() {
        if (this.locked) { return }
        const videos = document.getElementsByTagName('ytd-playlist-video-list-renderer')[0]
        const times = videos.getElementsByClassName('ytd-thumbnail-overlay-time-status-renderer')

        /** times is an HTMLElement or something, not an array,
         * so it doesn't have a .forEach method. We can invoke it
         * from the Array.prototype and it'll work the way we want
         *///                    ¯\_(ツ)_/¯
        let newTime = 0;
        Array.prototype.forEach.call(times, item => {
            newTime += this.lib.getSecondsFromTimestamp(item.innerText)
        })

        let timestamp = this.lib.getTimestampFromSeconds(newTime)

        if (this.lib.getPlaylistVideoCount() > times.length) {
            timestamp += '+'
        }

        this.element.innerText = timestamp

        this.cycleLock()
    }

    cycleLock() {
        this.locked = true;
        setTimeout((() => {
            this.locked = false
        }).bind(this), 1000)
    }

    static cleanup() {
        const oldElement = document.getElementById('YPDTimeElement')
        if (oldElement) { oldElement.remove() }
    }
}

/** Extension/Event Handlers */
let timeElement = null

function initYPD() {
    if (window.location.pathname.includes('playlist')) {
        timeElement = new PlaylistDuration()
        delayedRefresh()
    }
}

function negateYPD() {
    timeElement = null
    PlaylistDuration.cleanup()
}

function delayedRefresh() {
    if (!timeElement) { return }
    setInterval(timeElement.refresh.bind(timeElement), 1000)
}

/** Fires once when YouTube is first loaded */
window.addEventListener('load', initYPD)

/**
 * YouTube manages its own history and state and acts
 * as a full web-app, so 'onload' and 'load' events 
 * don't fire because as far as the browser is concerned
 * the page is already loaded. YouTube self-manages
 * navigation, so we need to hook into the start and stop
 * events for that navigation
 */
window.addEventListener('yt-navigate-start', negateYPD)
window.addEventListener('yt-navigate-finish', initYPD)

/**
 * Fires all the time and is a convenient hook for 
 * refreshing timestamp data. Ex: Initial playlist
 * only loads 100 videos until user scrolls through
 * the list, and this event will fire VERY OFTEN 
 * including when those extra videos load
 */
window.addEventListener('yt-visibility-refresh', () => {
    // Short-circuits if timeElement is null
    timeElement && timeElement.refresh()
})
window.addEventListener('yt-page-data-updated', () => {
    timeElement && timeElement.refresh()
})

// listeners
// [
//     'yt-page-data-updated',
//     'yt-navigate-start',
//     'yt-navigate-finish',
//     // 'yt-visibility-refresh',
//     'yt-player-requested',
//     'yt-page-type-changed',
//     'yt-navigate',
//     'load'
// ].forEach(event => window.addEventListener(event, console.log))

})()