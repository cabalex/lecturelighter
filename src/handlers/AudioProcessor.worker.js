// eslint-disable-next-line no-restricted-globals
self.onmessage = async ({data: [src, leftChannel, sampleRate, threshold, isRMSBuffer]}) => {
    // Array<[from: float seconds, to: float seconds]>
    let skipRegions = [];

    let step = Math.round(sampleRate / 10);

    function toSeconds(i) {
        return i / sampleRate;
    }

    let loudestSample = 0;
    let samplesRMS = isRMSBuffer ? leftChannel : new Float32Array(Math.ceil(leftChannel.length / step));
    if (!isRMSBuffer) {
        for (let i = step; i < leftChannel.length; i += step) {
            let samples = Array.from(leftChannel.slice(i - step, i));
            let sum = samples.reduce((a, b) => Math.abs(a) + Math.abs(b), 0);
            let rms = Math.sqrt(sum / step);

            samplesRMS[i/step] = rms;

            if (rms > loudestSample) loudestSample = rms;
        }
    } else {
        // find loudest
        for (let i = 0; i < samplesRMS.length; i++) {
            if (leftChannel[i] > loudestSample) loudestSample = leftChannel[i];
        }
    }

    let fromSample = null;
    for (let i = 0; i < samplesRMS.length; i++) {
        let isLoud = samplesRMS[i] / loudestSample > threshold;

        if (isLoud && fromSample) {
            skipRegions.push(Float32Array.from([toSeconds(fromSample * step), toSeconds(i * step)]));
            fromSample = null;
        } else if (!isLoud && !fromSample) {
            fromSample = i;
        }
    }

    if (fromSample) {
        skipRegions.push(Float32Array.from([toSeconds(fromSample * step), toSeconds(leftChannel.length)]));
    }

    // filter out regions that are obnoxiously short
    skipRegions = skipRegions.filter(region => region[1] - region[0] > 0.5);

    if (isRMSBuffer) {
        postMessage([src, skipRegions]);
    } else {
        postMessage([src, samplesRMS, skipRegions]);
    }
}
