const body = document.body;
const $doc = $(document);

const AUDIO = {

	html5AudioAvailable: (function() {
        var state = false;
        try {
            var a = new Audio();
            state = a.canPlayType && (/maybe|probably/).test(a.canPlayType('audio/mpeg'));
        } catch(error) {
            console.log(error);
            // there's no audio support here sadly
        }
        return state;
	}()),

	callbacks: {
		onReady () {
		    $doc.trigger('scPlayer:onAudioReady');
		},

		onPlay () {
		    $doc.trigger('scPlayer:onMediaPlay');
		},

		onPause () {
		    $doc.trigger('scPlayer:onMediaPause');
		},

		onEnd () {
		    $doc.trigger('scPlayer:onMediaEnd');
		},

		onBuffer (percent) {
		    $doc.trigger({type: 'scPlayer:onMediaBuffering', percent: percent});
		},
	},

    onTimeUpdate: function(event) {
        var obj = event.target,
            buffer = ((obj.buffered.length && obj.buffered.end(0)) / obj.duration) * 100;

        // ipad has no progress events implemented yet
        AUDIO.callbacks.onBuffer(buffer);
        // anounce if it's finished for the clients without 'ended' events implementation
        if (obj.currentTime === obj.duration) { AUDIO.callbacks.onEnd(); }
    },

    onProgress: function(event) {
        var obj = event.target,
            buffer = ((obj.buffered.length && obj.buffered.end(0)) / obj.duration) * 100;
        AUDIO.callbacks.onBuffer(buffer);
    },

    html5: function() {
        var player = new Audio(),
        	playerInit = $('<div class="slvr-player__container"></div>');

        playerInit.appendTo(body).append(player);

        // prepare the listeners
        player.addEventListener('play', AUDIO.callbacks.onPlay, false);
        player.addEventListener('pause', AUDIO.callbacks.onPause, false);

        // handled in the onTimeUpdate for now untill all the browsers support 'ended' event
        // player.addEventListener('ended', AUDIO.callbacks.onEnd, false);
        player.addEventListener('timeupdate', AUDIO.onTimeUpdate, false);
        player.addEventListener('progress', AUDIO.onProgress, false);

        return {
            load: function(track, apiKey) {
                player.pause();
                player.src = track.stream_url + (/\?/.test(track.stream_url) ? '&' : '?') + 'consumer_key=' + apiKey;
                player.load();
                player.play();
            },

            play: function() {
                player.play();
            },

            pause: function() {
                player.pause();
            },

            stop: function() {
                if (player.currentTime) {
                    player.currentTime = 0;
                    player.pause();
                }
            },

            seek: function(relative) {
                player.currentTime = player.duration * relative;
                player.play();
            },

            getDuration: function() {
                return player.duration * 1000;
            },

            getPosition: function() {
                return player.currentTime * 1000;
            },

            setVolume: function(val) {
                player.volume = val / 100;
            }
        };
    },

    flash: function() {
        var engineId = 'scPlayerEngine',
            player,
            flashHtml = function(url) {
                var swf = (secureDocument ? 'https' : 'http') + '://player.' + domain +'/player.swf?url=' + url +'&amp;enable_api=true&amp;player_type=engine&amp;object_id=' + engineId;
                if ($.browser.msie) {
                    return  '<object height="100%" width="100%" id="' + engineId + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" data="' + swf + '">'+
                                '<param name="movie" value="' + swf + '" />'+
                                '<param name="allowscriptaccess" value="always" />'+
                            '</object>';
                } else {
                    return  '<object height="100%" width="100%" id="' + engineId + '">'+
                                '<embed allowscriptaccess="always" height="100%" width="100%" src="' + swf + '" type="application/x-shockwave-flash" name="' + engineId + '" />'+
                            '</object>';
                }
            };

        // listen to audio engine events
        // when the loaded track is ready to play
        soundcloud.addEventListener('onPlayerReady', function(flashId, data) {
            player = soundcloud.getPlayer(engineId);
            AUDIO.callbacks.onReady();
        });

        // when the loaded track finished playing
        soundcloud.addEventListener('onMediaEnd', AUDIO.callbacks.onEnd);

        // when the loaded track is still buffering
        soundcloud.addEventListener('onMediaBuffering', function(flashId, data) {
            AUDIO.callbacks.onBuffer(data.percent);
        });

        // when the loaded track started to play
        soundcloud.addEventListener('onMediaPlay', AUDIO.callbacks.onPlay);

        // when the loaded track is was paused
        soundcloud.addEventListener('onMediaPause', AUDIO.callbacks.onPause);

        return {
            load: function(track) {
                var url = track.uri;
                if(player) {
                    player.api_load(url);
                } else {
                    // create a container for the flash engine (IE needs this to operate properly)
                    $('<div class="slvr-player__container"></div>').appendTo(body).html(flashHtml(url));
                }
            },

            play: function() {
                return player && player.api_play();
            },

            pause: function() {
                return player && player.api_pause();
            },

            stop: function() {
                return player && player.api_stop();
            },

            seek: function(relative) {
                return player && player.api_seekTo((player.api_getTrackDuration() * relative));
            },

            getDuration: function() {
                return player && player.api_getTrackDuration && player.api_getTrackDuration() * 1000;
            },

            getPosition: function() {
                return player && player.api_getTrackPosition && player.api_getTrackPosition() * 1000;
            },

            setVolume: function(val) {
                if(player && player.api_setVolume) {
                    player.api_setVolume(val);
                }
            }
        };
    },

}

export default {    
    available: AUDIO.html5AudioAvailable,
	html5Driver: AUDIO.html5,
	flashDriver: AUDIO.flash,
    onReady: AUDIO.callbacks.onReady,
    onPlay: AUDIO.callbacks.onPlay,
    onPause: AUDIO.callbacks.onPause,
    onEnd: AUDIO.callbacks.onEnd,
    onBuffer: AUDIO.callbacks.onBuffer
};