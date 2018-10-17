const UTIL = {

	isMobile: {
	    Android: function() {
	        return navigator.userAgent.match(/Android/i);
	    },

	    BlackBerry: function() {
	        return navigator.userAgent.match(/BlackBerry/i);
	    },

	    iOS: function() {
	        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	    },

	    Opera: function() {
	        return navigator.userAgent.match(/Opera Mini/i);
	    },

	    Windows: function() {
	        return navigator.userAgent.match(/IEMobile/i);
	    },

	    any: function() {
	        return (UTIL.isMobile.Android() || UTIL.isMobile.BlackBerry() || UTIL.isMobile.iOS() || UTIL.isMobile.Opera() || UTIL.isMobile.Windows());
	    }
	}
}

export default {    
    isMobile: UTIL.isMobile
}