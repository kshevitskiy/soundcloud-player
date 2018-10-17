const ARTWORK = {

	image (track, usePlaceholder) {
		if(usePlaceholder) {
			return `<div class="loading-artwork"></div>`;
		} else if (track.artwork_url) {
			return `<img src="${track.artwork_url.replace('-large', '-t500x500')}" width="500" height="500" alt="${track.title}" title="${track.title}" class="track__cover" itemprop="image" />`;
		} else {
			return `<img src="${track.user.avatar_url.replace('-large', '-t500x500')}" width="500" height="500" alt="${track.title}" title="${track.title}" class="track__cover" itemprop="image"/>`;
		}
	}
}

export default {    
    image: ARTWORK.image
};