const CONVERT = {

    time: function(ms) {
        // Convert milliseconds into Hours (h), Minutes (m), and Seconds (s)
        var hms = (function(ms) {
                return {
                    h: Math.floor(ms/(60*60*1000)),
                    m: Math.floor((ms/60000) % 60),
                    s: Math.floor((ms/1000) % 60)
                };
            }(ms)),
            tc = []; // Timecode array to be joined with '.'

        if (hms.h > 0) {
            tc.push(hms.h);
        }

        tc.push((hms.m < 10 && hms.h > 0 ? '0' + hms.m : hms.m));
        tc.push((hms.s < 10  ? '0' + hms.s : hms.s));

        return tc.join('.');
    },	
}

export default {    
    time: CONVERT.time
};