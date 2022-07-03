import VideoHandler, { VideoPlaylistInstance, SkipRegion } from "./VideoHandler";

export default class LoadQueue {
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
                if (instance.rms == null) {
                    let audioBuffer = await this.getAudioBuffer(instance.src).catch(() => {});
                    if (audioBuffer) {
                        instance.duration = audioBuffer.duration;
                        instance.sampleRate = audioBuffer.sampleRate;

                        [instance.skipRegions, instance.rms] = await this.processAudio(instance.src, audioBuffer, this.parent.audioThreshold).catch(() => [null, null]);
                        
                        if (this.parent.getCachedLoad() > 500000) {
                            // Don't cache any further if above 500k elements (~2 MB in Float32Array)
                            instance.rms = null;
                        }

                        if (instance.skipRegions !== null) {
                            this.parent.videoLoadedSkipRegions(instance);
                        } else {
                            this.parent.videoError(instance);
                        }
                    } else {
                        this.parent.videoError(instance);
                    }
                } else {
                    instance.skipRegions = await this.reprocessAudio(instance.src, instance.rms, instance.sampleRate, this.parent.audioThreshold).catch(() => null);
                    if (instance.skipRegions !== null) {
                        this.parent.videoLoadedSkipRegions(instance);
                    } else {
                        this.parent.videoError(instance);
                    }
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
            };
            req.onerror = (e) => reject(e);
            req.send()
        })
    }

    private reprocessAudio(src: string, rmsBuffer: Float32Array, sampleRate: number, threshold=this.parent.audioThreshold) : Promise<SkipRegion[]> {
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
                this.audioProcessor.postMessage([src, rmsBuffer, sampleRate, threshold, true])
            } catch(e) {
                reject(e);
            }
        })
    }

    private processAudio(src: string, audioBuffer: AudioBuffer, threshold=this.parent.audioThreshold) : Promise<[SkipRegion[], Float32Array]> {
        let ctx = this;

        return new Promise((resolve, reject) => {
            function onMessage(e:any) {
                const [messageSrc, rms, regions] = e.data;
                if (src === messageSrc) {
                    resolve([regions, rms]);
                    ctx.audioProcessor.removeEventListener('message', onMessage);
                }
            }
            this.audioProcessor.addEventListener('message', onMessage)
    
            try {
                this.audioProcessor.postMessage([src, audioBuffer.getChannelData(0), audioBuffer.sampleRate, threshold, false])
            } catch(e) {
                reject(e);
            }
        })
    }
}