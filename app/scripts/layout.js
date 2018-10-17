import ARTWORK   from './components/artwork'
import CALCULATE from './calculations'

const LAYOUT = {

	list: function(index, active, $tracklist, track) {
		var dropdownWrapper = $('<div class="dropdown"></div>'),
			dropdownContent = $('<ul class="dropdown-content"></ul>'),
			dropdownToggle	= $('<button type="button" class="button button-share dropdown-button" title="Share">Share</button>');			

		var facebook = $('<a class="trackShare__link" href="https://www.facebook.com/sharer/sharer.php?u=' + track.permalink_url + '" target="_blank">Facebook</span></a>'),
			twitter  = $('<a class="trackShare__link" href="https://twitter.com/share?url=' + track.permalink_url + '&amp;text=' + track.title + '" target="_blank">Twitter</a>'),
			gplus 	 = $('<a class="trackShare__link" href="https://plus.google.com/share?url=' + track.permalink_url + '" target="_blank">Google+</span></a>');

		var $track             = $('<li class="track" itemscope itemtype="http://schema.org/MusicRecording"></li>').data('sc-track', {id:index}).toggleClass('active', active).appendTo($tracklist),
		  
			$trackArtwork      = $('<figure class="track-artwork"></figure>').append(ARTWORK.image(track)).appendTo($track),
			$track__play       = $('<div class="play-action"><i class="icon icon__play" style="display:none;"></i><i class="icon icon__pause" style="display:none;"></i></div>').appendTo($trackArtwork),		  
			
			$trackMeta     	   = $('<div class="track-meta"></div>').appendTo($track),
			$trackMeta__title  = $('<h3 class="track__title" title="' + track.title + '" itemprop="audio"><span itemprop="name">' + track.title + '</span></h3>').appendTo($trackMeta),
			$trackMeta__artist = $('<h4 class="track__artist" title="' + track.user.username + '">' + track.user.username + '</h4>').appendTo($trackMeta),

			$trackDuration = $('<meta itemprop="duration" content="' + CALCULATE.time(track.duration) + '">').appendTo($trackMeta),                                
			$trackLink     = $('<link itemprop="url" href="' + track.permalink_url +'">').appendTo($trackMeta),			

			$trackControls = $('<div class="track-controls"></div>').appendTo($track);

		// add buy link if it's not empty
		if (track.purchase_url !== null) {
			$('<a href="' + track.purchase_url + '" class="button button-stream" target="_blank" itemprop="offers" title="Stream">Stream</a>').appendTo($trackControls);
		}			

		dropdownWrapper.appendTo($trackControls);
		dropdownToggle.appendTo(dropdownWrapper);
		dropdownContent.appendTo(dropdownWrapper);			
		facebook.appendTo(dropdownContent);
		twitter.appendTo(dropdownContent);
		gplus.appendTo(dropdownContent);			
	},

	grid: function(index, active, $tracklist, track) {
		var dropdownWrapper = $('<div class="dropdown"></div>'),
			dropdownContent = $('<ul class="dropdown-content"></ul>'),
			dropdownToggle	= $('<button type="button" class="button button-share dropdown-button" title="Share">Share</button>');

		var facebook = $('<a class="trackShare__link" href="https://www.facebook.com/sharer/sharer.php?u=' + track.permalink_url + '" target="_blank">Facebook</span></a>'),
			twitter  = $('<a class="trackShare__link" href="https://twitter.com/share?url=' + track.permalink_url + '&amp;text=' + track.title + '" target="_blank">Twitter</a>'),
			gplus 	 = $('<a class="trackShare__link" href="https://plus.google.com/share?url=' + track.permalink_url + '" target="_blank">Google+</span></a>');

		var $track             = $('<li class="track" itemscope itemtype="http://schema.org/MusicRecording"></li>').data('sc-track', {id:index}).toggleClass('active', active).appendTo($tracklist),
		  
			$trackArtwork      = $('<figure class="track-artwork"></figure>').append(ARTWORK.image(track)).appendTo($track),
						
			$track__play       = $('<div class="play-action"><i class="icon icon__play" style="display:none;"></i><i class="icon icon__pause" style="display:none;"></i></div>').appendTo($trackArtwork),                

			$trackControls     = $('<div class="track-controls"></div>').appendTo($trackArtwork),                
			$track__duration   = $('<meta itemprop="duration" content="' + CALCULATE.time(track.duration) + '">').appendTo($trackControls),                                
			$track__link       = $('<link itemprop="url" href="' + track.permalink_url +'">').appendTo($trackControls),			

			$trackMeta         = $('<header class="track-meta"></header>').appendTo($track),
			$trackMeta__title  = $('<h3 class="track__title" title="' + track.title + '" itemprop="audio"><span itemprop="name">' + track.title + '</span></h3>').appendTo($trackMeta),
			$trackMeta__artist = $('<h4 class="track__artist" title="' + track.user.username + '">' + track.user.username + '</h4>').appendTo($trackMeta);

			// add buy link if it's not empty
			if (track.purchase_url !== null) {
				$('<a href="' + track.purchase_url + '" class="button button-stream" target="_blank" itemprop="offers" title="Stream">Stream</a>').appendTo($trackControls);
			}

			dropdownWrapper.appendTo($trackControls);
			dropdownToggle.appendTo(dropdownWrapper);
			dropdownContent.appendTo(dropdownWrapper);			
			facebook.appendTo(dropdownContent);
			twitter.appendTo(dropdownContent);
			gplus.appendTo(dropdownContent);			
	},	
}

export default {
    list: LAYOUT.list,
    grid: LAYOUT.grid
};