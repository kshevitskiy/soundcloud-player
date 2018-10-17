import UI from './ui'

const CONTROLS = {

	scrubber: {

		scrub: function(node, xPos, onSeek) {
	        var $scrubber = $(node).closest('.playbackTimeline'),
	            $buffer = $scrubber.find('.sc-buffer'),
	            $available = $scrubber.find('.sc-seek'),
	            $player = $scrubber.closest('.slvr-player'),
	            relative = Math.min($buffer.width(), (xPos  - $available.offset().left)) / $available.width();
	        onSeek($player, relative);					
		},

		onTouchMove: function(ev) {
			if (ev.targetTouches.length === 1) {
				CONTROLS.scrubber.scrub(ev.target, ev.targetTouches && ev.targetTouches.length && ev.targetTouches[0].clientX);
				ev.preventDefault();
	        }
		},		
	},

	volume: {
		soundVolume: (function() {
	        var vol = 100,
				cooks = document.cookie.split(';'),
				volRx = new RegExp('scPlayer_volume=(\\d+)');

	        for(var i in cooks){
	        	if(volRx.test(cooks[i])){
					vol = parseInt(cooks[i].match(volRx)[1], 10);
					break;
				}
	        }
	        return vol;
		}()),

		onVolume: function(volume, audioEngine) {
			var vol = Math.floor(volume);
			// save the volume in the cookie
			var date = new Date();
			date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
			CONTROLS.volume.soundVolume = vol;
			document.cookie = ['scPlayer_volume=', vol, '; expires=', date.toUTCString(), '; path="/"'].join('');
			// update the volume in the engine
			audioEngine.setVolume(CONTROLS.volume.soundVolume);		
		},

		volumeTracking: function(node, startEvent, $doc) {
			var $node = $(node),
				val = $node.val(),
				getVolume = function() {
					return Math.floor(val * 100);
	            },

	            update = function(event) {
	            	$doc.trigger({type: 'scPlayer:onVolumeChange', volume: getVolume(event.pageX)});
	            };

			$node.bind('.slvr-player', update);
			update(startEvent);
		},
	},

	play: function(playButton) {	
        var $player = playButton.parents('.slvr-player'),
        	$tracklist = $player.find('.tracklist'),
        	activeTrack = $tracklist.find('.track.active .track__cover'),
            play = $player.is(':not(.playing)');

        if (play) {
        	playButton.addClass('sc-pause');
        	playButton.attr('title', 'Pause');
        } else {
			playButton.removeClass('sc-pause');
			playButton.attr('title', 'Play');            	          	
        }

    	// simulate the click in the tracklist
		activeTrack.click();

		return false;
	},

	prevTrack: function(prevButton) {
        var player = prevButton.parents('.slvr-player'),
        	tracklist = player.find('.tracklist'),
            currentTrack = tracklist.find('.track.active'),
            prevTrack = currentTrack.prev();

		prevTrack.find('.track__cover').click();
	},

	nextTrack: function(nextButton) {
        var player = nextButton.parents('.slvr-player'),
        	tracklist = player.find('.tracklist'),
            currentTrack = tracklist.find('.track.active'),
            nextTrack = currentTrack.next();

		nextTrack.find('.track__cover').click();
	},

	trackNav: function(prevButton, nextButton) {
        var player = $('.slvr-player'),
        	tracklist = player.find('.tracklist'),
        	track = tracklist.find('.track'),
        	currentTrack = tracklist.find('.track.active'),
			trackId = track.data('sc-track').id,
			currentTrackId = currentTrack.data('sc-track').id,
			lastTrackId = track.last().data('sc-track').id;

        currentTrackId === 0 ? prevButton.prop('disabled', 'true') : 
            			prevButton.prop('disabled', '');

        currentTrackId === lastTrackId ? nextButton.prop('disabled', 'true') : 
            					  nextButton.prop('disabled', '');
	},	

	playTrack: function(track, onPlay, onPause) {
        var $player = track.parents('.slvr-player'),
            trackId = track.data('sc-track').id,
            play = $player.is(':not(.playing)') || track.is(':not(.active)'),
            playAction = track.find('.play-action').children(':first');

        if (play) {
            onPlay($player, trackId);
            UI.playAnimation(playAction);
        } else {
            onPause($player);
            UI.playAnimation(playAction);
        }                
        
        track.addClass('active').siblings('li').removeClass('active');
        $('.artworks li', $player).each(function(index) {
            $(this).toggleClass('active', index === trackId);
        });

        CONTROLS.trackNav($('.prev-track'), $('.next-track'));

        return false;           
	}
}

export default {
	// Scrubber
    scrub: CONTROLS.scrubber.scrub,
    onTouchMove: CONTROLS.scrubber.onTouchMove,

	// Volume
	soundVolume: CONTROLS.volume.soundVolume,
    onVolume: CONTROLS.volume.onVolume,
    volumeTracking: CONTROLS.volume.volumeTracking,

    // Widget play/pause, next, prev
    play: CONTROLS.play,
    nextTrack: CONTROLS.nextTrack,
    prevTrack: CONTROLS.prevTrack,    
    trackNav: CONTROLS.trackNav,    

    // Tracklist
    playTrack: CONTROLS.playTrack
};