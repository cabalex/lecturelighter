
export interface SkipRegion {
    from: number,
    to: number
}

export interface VideoPlaylistInstance {
    src: string,
    duration: number,
    title: string,
    skipRegions: SkipRegion[] | null
}

class LoadQueue {
    queue: VideoPlaylistInstance[] = []
    running = false;
    parent: VideoHandler;
    audioProcessor: Worker = new Worker(new URL('./AudioProcessor.worker.js', import.meta.url));

    constructor(parent: VideoHandler) {
        this.parent = parent;
    }

    async add(instance: VideoPlaylistInstance) {
        this.queue.push(instance);

        if (!this.running) {
            this.loop();
        }
    }

    destroy() {
        this.running = true;
        this.queue = [];
        
        this.audioProcessor.terminate();
        this.audioProcessor = new Worker(new URL('./AudioProcessor.worker.js', import.meta.url));

        this.running = false;
    }

    async priority(instance: VideoPlaylistInstance) {
        let index = this.queue.indexOf(instance);
        if (index > -1) {
            this.queue.splice(index, 1);
            this.queue.unshift(instance);
        }

        return new Promise<SkipRegion[]>(resolve => {
            let interval = setInterval(() => {
                if (instance.skipRegions !== null) {
                    clearInterval(interval);
                    resolve(instance.skipRegions);
                };
            }, 100)
        })
    }

    private async loop() {
        this.running = true;
        while (this.queue.length) {
            const instance = this.queue.shift();
            if (instance) {
                let audioBuffer = await this.getAudioBuffer(instance.src).catch(() => {});
                if (audioBuffer) {
                    instance.duration = audioBuffer.duration;
                    instance.skipRegions = await this.processAudio(instance.src, audioBuffer, this.parent.audioThreshold).catch(() => null);
                    if (instance.skipRegions) {
                        this.parent.videoLoadedSkipRegions(instance);
                    } else {
                        this.parent.videoError(instance);
                    }
                } else {
                    this.parent.videoError(instance);
                }
            }
        }
        this.running = false;
    }

    private async getAudioBuffer(url: string) : Promise<AudioBuffer> {
        let audioContext = new AudioContext();
        return await new Promise((resolve, reject) => {
            var req = new XMLHttpRequest();
            req.open( "GET", url, true );
            req.responseType = "arraybuffer";    
            req.onreadystatechange = function (e) {
                if (req.readyState === 4 && req.status === 200) {
                    audioContext.decodeAudioData(req.response, (buffer) => resolve(buffer)).catch((e) => reject(e));
                }
            } ;
            req.send();
        })
    }

    private processAudio(src: string, audioBuffer: AudioBuffer, threshold=-25) : Promise<SkipRegion[]> {
        let ctx = this;

        return new Promise((resolve, reject) => {
            function onMessage(e:any) {
                const [messageSrc, regions] = e.data;
                if (src === messageSrc) {
                    resolve(regions);
                    ctx.audioProcessor.removeEventListener('message', onMessage);
                }
            }
            this.audioProcessor.addEventListener('message', onMessage)
    
            try {
                this.audioProcessor.postMessage([src, audioBuffer.getChannelData(0), audioBuffer.sampleRate, threshold])
            } catch(e) {
                reject(e);
            }
        })
    }
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
    audioThreshold: number = -25; // Audio threshold (smaller negative number is louder)

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
        this.message('loaderror', this.playlist.indexOf(instance));
    }

    videoLoadedSkipRegions(instance: VideoPlaylistInstance) {
        this.message('loadedplaylistskipregions', this.playlist.indexOf(instance));
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

    calculateTrimmedDuration() {
        let skipDuration = 0;
        let normalDuration = 0;
        let lastRegion = 0;

        let skipRegions = this.skipRegions || [];

        for (let i = 0; i < skipRegions.length; i++) {
            let region = skipRegions[i];
            
            normalDuration += region.from - lastRegion;
            
            skipDuration += region.to - region.from;
            lastRegion = region.to;
        }
        normalDuration += this.video.duration - lastRegion;


        return normalDuration / this.normalSpeed + (this.skipSpeed === -1 ? 0 : skipDuration / this.skipSpeed);
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
        if (!this.video.paused) {
            cancelAnimationFrame(this.handle);
            this.handle = requestAnimationFrame(this.render.bind(this));
        }
        this.message('timeupdate');
        let inside = this.skipRegions.filter(region => (this.video.currentTime >= region.from && this.video.currentTime < region.to))
        if (inside.length > 0) {
            if (this.skipSpeed === -1) {
                this.video.currentTime = inside[0].to + 0.01;
                this.video.playbackRate = this.normalSpeed;
            } else {
                this.video.playbackRate = this.skipSpeed;
            }
        } else {
            if (this.normalSpeed !== -1)
            this.video.playbackRate = this.normalSpeed;
        }
    }
}

export default VideoHandler;