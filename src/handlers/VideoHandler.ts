import LoadQueue from "./LoadQueue";

export interface SkipRegion {
    from: number,
    to: number
}

export interface VideoPlaylistInstance {
    src: string,
    duration: number,
    sampleRate: number,
    title: string,
    skipRegions: SkipRegion[] | null,
    rms: Float32Array | null,
}

class VideoHandler {
    video: HTMLVideoElement;

    subscribers = new Map();

    skipRegions: SkipRegion[] = [];
    playlistIndex = 0;
    playlist: VideoPlaylistInstance[] = [];

    loadQueue = new LoadQueue(this);

    isLoadingSkipRegions = false;

    normalSpeed: number = 1;
    skipSpeed: number = 2;
    audioThreshold: number = 0.3; // Audio threshold (0 - 1, relative)

    handle: number = 0; // handle for requestAnimationFrame to prevent multiple calls

    constructor(video?: HTMLVideoElement) {
        this.video = video || document.createElement('video');
        this.video.addEventListener('timeupdate', this.render.bind(this));
        this.video.addEventListener('ended', () => {
            this.message('ended')
            if (this.playlistIndex + 1 < this.playlist.length) {
                this.load(this.playlistIndex + 1);
            }
        });
        this.video.addEventListener('loadedmetadata', () => this.message('loadedmetadata'));
        this.video.addEventListener('loadeddata', () => this.message('loadeddata'));
    }

    addVideo(url: string, title?: string) {
        let item = {
            src: url,
            title: title || url,
            duration: 0,
            sampleRate: 0,
            rms: null,
            skipRegions: null
        } as VideoPlaylistInstance;
        
        this.playlist.push(item)
        
        if (this.playlist.length === 1) {
            this.load(0);
        }

        this.message('playlistadd');

        this.loadQueue.add(item);
    }

    videoError(instance: VideoPlaylistInstance) {
        let index = this.playlist.indexOf(instance);
        this.message('loaderror', index);
        
        if (index === this.playlistIndex) {
            this.isLoadingSkipRegions = false;
            this.message('loadedskipregions');
        }
    }

    videoLoadedSkipRegions(instance: VideoPlaylistInstance) {
        this.message('loadedplaylistskipregions', this.playlist.indexOf(instance));
    }

    setNormalSpeed(speed: number) {
        this.normalSpeed = speed;
        this.message('speedchange');
    }
    setSkipSpeed(speed: number) {
        this.skipSpeed = speed;
        this.message('speedchange');
    }
    setAudioThreshold(threshold: number) {
        this.audioThreshold = threshold;
        this.message('audiochange');

        if (this.playlist.length > 0) {
            this.skipRegions = [];
            this.isLoadingSkipRegions = true;

            this.playlist.forEach(item => {
                item.skipRegions = null;
                if (item.rms && !this.loadQueue.queue.includes(item)) {
                    this.loadQueue.add(item);
                    this.loadQueue.priority(item);
                }
            });
            
            this.loadQueue.priority(this.playlist[this.playlistIndex])
                .then(regions => {
                    this.skipRegions = regions;
                    this.message('loadedskipregions');
                    this.isLoadingSkipRegions = false;
                })  
        }
    }

    getCachedLoad() {
        return this.playlist.map(item => {
            return item.rms ? item.rms.length : 0;
        }).reduce((a, b) => a + b, 0);
    }

    async load(newIndex: number) {
        let video = this.playlist[newIndex];
        this.video.src = video.src;
        this.playlistIndex = newIndex;
        this.skipRegions = [];
        this.isLoadingSkipRegions = true;

        this.message('playlistchange');

        // Audio handling.
        if (video.skipRegions === null) {
            this.skipRegions = await this.loadQueue.priority(video);
        } else {
            this.skipRegions = video.skipRegions;
        }

        this.message('loadedskipregions');
        this.isLoadingSkipRegions = false;
    }

    nextVideo() {
        if (this.playlistIndex + 1 < this.playlist.length) this.load(this.playlistIndex + 1);
    }
    previousVideo() {
        if (this.playlistIndex > 0) this.load(this.playlistIndex - 1);
    }

    destroy() {
        this.video.src = '';
        // remove from playlist
        this.playlist = [];
        this.loadQueue.destroy();

        this.message('destroyed');
    }

    removePlaylistItem(index: number = this.playlistIndex) {
        this.playlist.splice(index, 1);
        if (this.playlist.length === 0) {
            this.video.src = '';
        } else if (this.playlistIndex === index) {
            this.load(Math.min(this.playlistIndex, this.playlist.length - 1));
        } else if (this.playlistIndex > index) {
            this.playlistIndex--;
        }

        this.message('playlistremove');
    }

    isLoaded() {
        return this.video.src && this.video.src !== window.location.href && this.video.readyState > 0;
    }

    calculateTrimmedProgress() {
        let skipDuration = 0;
        let normalDuration = 0;
        let lastRegion = 0;

        let skipRegions = this.skipRegions || [];

        for (let i = 0; i < skipRegions.length; i++) {
            let region = skipRegions[i];

            if (region.from > this.video.currentTime) break;
            
            normalDuration += region.from - lastRegion;

            if (region.to > this.video.currentTime) break;
            
            skipDuration += region.to - region.from;
            lastRegion = region.to;
        }
        normalDuration += this.video.currentTime - lastRegion;


        return normalDuration / this.normalSpeed + (this.skipSpeed === -1 ? 0 : skipDuration / this.skipSpeed);
    }

    calculatePlaylistDuration() {
        let duration = 0;
        for (let i = 0; i < this.playlist.length; i++) {
            duration += this.calculateTrimmedDuration(i);
        }
        return duration;
    }

    calculateRemainingPlaylistDuration() {
        let duration = 0;
        for (let i = this.playlistIndex; i < this.playlist.length; i++) {
            duration += this.calculateTrimmedDuration(i);
        }
        return duration - this.calculateTrimmedProgress();
    }

    calculateTrimmedDuration(index=this.playlistIndex) {
        let skipDuration = 0;
        let normalDuration = 0;
        let lastRegion = 0;

        let skipRegions = this.playlist[index].skipRegions || [];

        for (let i = 0; i < skipRegions.length; i++) {
            let region = skipRegions[i];
            
            normalDuration += region.from - lastRegion;
            
            skipDuration += region.to - region.from;
            lastRegion = region.to;
        }
        normalDuration += (index === this.playlistIndex ? this.video.duration : this.playlist[index].duration) - lastRegion;


        return (this.normalSpeed === -1 ? 0 : normalDuration / this.normalSpeed) + (this.skipSpeed === -1 ? 0 : skipDuration / this.skipSpeed);
    }

    subscribe(label: string, callback: any) {
        let subs = this.subscribers.get(label);
        if (!subs) {
            this.subscribers.set(label, [callback]);
        } else {
            if (subs.indexOf(callback) === -1)
                this.subscribers.get(label).push(callback);
        }
    }

    private message(label: string, data?: any) {
        let subs = this.subscribers.get(label);
        if (subs) {
            subs.forEach((callback:any) => callback(data));
        }
    }

    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }

    play() {
        this.video.play();
        this.render();
    }

    pause() {
        this.video.pause();
    }

    render() {
        /*if (!this.video.paused) {
            cancelAnimationFrame(this.handle);
            this.handle = requestAnimationFrame(this.render.bind(this));
        }*/
        this.message('timeupdate');
        
        let inside = this.skipRegions.filter(region => (this.video.currentTime >= region.from && this.video.currentTime < region.to))
        
        if (inside.length > 0) {
            if (this.skipSpeed === -1) {
                this.video.currentTime = inside[0].to + 0.01;
            } else if (this.video.playbackRate !== this.skipSpeed) {
                this.video.playbackRate = this.skipSpeed;
            }
        } else {
            if (this.normalSpeed === -1) {
                let next = this.skipRegions.filter(region => this.video.currentTime < region.from);
                if (next.length > 0) {
                    this.video.currentTime = next[0].from;
                } else {
                    this.video.currentTime = this.video.duration;
                }
            } else if (this.video.playbackRate !== this.normalSpeed) {
                this.video.playbackRate = this.normalSpeed;
            }
        }
    }
}

export default VideoHandler;