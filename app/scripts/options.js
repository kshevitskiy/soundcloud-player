const OPTIONS = {

	defaults: {
		apiKey: 'htuiRd1JP11Ww0X72T1C3g',
		autoPlay: false,
		continuePlayback: true,
		randomize: false,
		loadArtworks: 1,
		layout: 'grid',
		skin: 'light',
		beforeRender : function(tracksData) {
		    var $player = $(this);
		}
	},	
}

export default {    
    defaults : OPTIONS.defaults
};