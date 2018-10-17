const SHUFFLE = {

	init: function(arr) {
		arr.sort(function() { return 1 - Math.floor(Math.random() * 3); } );
		return arr;
	}
}

export default {
    init: SHUFFLE.init
};