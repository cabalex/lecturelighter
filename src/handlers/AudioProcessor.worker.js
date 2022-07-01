// eslint-disable-next-line no-restricted-globals
self.onmessage = async ({data: [src, leftChannel, sampleRate, threshold]}) => {
    let skipRegions = [];

    if (leftChannel.length < 1000) return [];
    let step = Math.round(sampleRate / 100);

    function toSeconds(i) {
        return i / sampleRate;
    }

    let fromSample = null;
    for (let i = step; i < leftChannel.length; i += step) {
        let samples = Array.from(leftChannel.slice(i - step, i));
        let sum = samples.reduce((a, b) => Math.abs(a) + Math.abs(b), 0);
        var rms = Math.sqrt(sum / step);
        var decibel = 20 * (Math.log(rms) / Math.log(10));


        if (decibel > -25 && fromSample) {
            skipRegions.push({
                from: toSeconds(fromSample),
                to: toSeconds(i)
            });
            fromSample = null;
        } else if (!(decibel > -25) && !fromSample) {
            fromSample = i;
        }
    }

    if (fromSample) {
        skipRegions.push({
            from: toSeconds(fromSample),
            to: toSeconds(leftChannel.length)
        });
    }

    // filter out regions that are obnoxiously short
    postMessage([src, skipRegions.filter(region => region.to - region.from > 0.5)]);
}
