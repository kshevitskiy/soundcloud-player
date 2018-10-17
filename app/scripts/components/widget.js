import ARTWORK from './artwork'

import UTIL from '../utilities'

let widget 	  		= $('<div class="slvr-widget widget"></div>'),
	playControls 	= $('<div class="playControls controls sc-controls"></div>'),
	badge        	= $('<div class="playControls__badge"></div>'),
	badgeArtwork 	= $('<ul class="badge__artwork artworks"></ul>'),
	badgeTitle 		= $('<div class="badge__title"><h3></h3><h4></h4></div>'),
	play 			= $('<button type="button" title="Play" class="playControls__play button button__play">Play</button>'),
	nextTrack 		= $('<button type="button" title="Next" class="button next-track">Next</button>'),
	prevTrack 		= $('<button type="button" title="Previous" class="button prev-track">Previous</button>'),
	volume 			= $('<div class="playControls__volume">' +
							'<input type="range" class="sc-volume-status" min="0" max="1" step="0.01" value="1" />' +
						'</div>'),
	timeline       	= $('<div class="playControls__timeline">' +
							'<div class="playbackTime">' +
								'<div class="playbackTime__inner">' +
									'<span class="playbackTime__current"></span>' +
									'<span class="playbackTime__duration"></span>' +
								'</div>' +
	                        '</div>' +
	                        '<div class="playbackTimeline">' +                                                                        
								'<div class="sc-seek"></div>' +
								'<div class="sc-buffer"></div>' +
								'<div class="sc-played"></div>' +                                    
							'</div>' +
						'</div>'),					
	expand 			= $('<button type="button" title="Expand" class="playControls__toggle button button__expand"><span></span><span></span><span></span></button>'),
	cover          	= $('<div class="widget__cover"></div>');

const WIDGET = {

	markup (player) {		
		// player.append(template);
		widget.appendTo(player);		
		playControls.appendTo(widget);
		badge.appendTo(playControls);
		badgeArtwork.appendTo(badge);
		badgeTitle.appendTo(badge);
		prevTrack.appendTo(playControls);
		play.appendTo(playControls);
		nextTrack.appendTo(playControls);
		volume.appendTo(playControls);
		timeline.appendTo(playControls);
		expand.appendTo(playControls);
		cover.appendTo(widget);
	},

	expand () {
		let widget = $('.widget');
		let volume = $('.playControls__volume');
		let coverAndTime = $('.widget__cover, .playbackTime');
		
		coverAndTime.fadeOut(300); 
		if(UTIL.isMobile.any()) {
			volume.fadeOut(300);
		}				

		setTimeout(function() {
			widget.toggleClass('opened');                
		}, 300);

		setTimeout(function() {
			coverAndTime.fadeIn(300);
			if(UTIL.isMobile.any()) {
				volume.fadeIn(300);
			}
		}, 600);
	},

	cover () {
		const $bg = $('.widget__cover');
		const $imageSrc = $('.badge__artwork .active img').attr('src');
		console.log($imageSrc);
		if($imageSrc !== undefined) {
			$bg.css('backgroundImage', `url('${$imageSrc}')`);
		}
	},

	artwork (track, index, active) {
		var $cover = $('<li></li>')
			.append(ARTWORK.image(track, index))
			.appendTo(badgeArtwork)
			.toggleClass('active', active)
			.data('sc-track', track);
	},

	events () {
		let expandButton = widget.find('.playControls__toggle');
		expandButton.on('click', WIDGET.expand);
	},

	init (player) {
		WIDGET.markup(player);
		WIDGET.events();
	}
}

export default {    
    init: WIDGET.init,
	artwork: WIDGET.artwork,
	cover: WIDGET.cover
};