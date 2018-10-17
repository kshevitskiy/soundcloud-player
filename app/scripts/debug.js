let debug 	   = true,
	useSandBox = false,
	domain = useSandBox ? 'sandbox-soundcloud.com' : 'soundcloud.com',
	secureDocument = (document.location.protocol === 'https:');

const DEBUG = {

	log: function(args) {
		try {
			if(debug && window.console && window.console.log){
				window.console.log.apply(window.console, arguments);
			}
		} catch (e) {
			// no console available
		}
	},

	scApiUrl: function(url, apiKey) {
		// convert a SoundCloud resource URL to an API URL
		var resolver = ( secureDocument || (/^https/i).test(url) ? 'https' : 'http') + '://api.' + domain + '/resolve?url=',
			params = 'format=json&consumer_key=' + apiKey +'&callback=?';

		// force the secure url in the secure environment
		if( secureDocument ) {
			url = url.replace(/^http:/, 'https:');
		}

		// check if it's already a resolved api url
		if ( (/api\./).test(url) ) {
			return url + '?' + params;
		} else {
			return resolver + url + '&' + params;
		}
	},
}

export default {    
    log: DEBUG.log,
    scApiUrl: DEBUG.scApiUrl
};