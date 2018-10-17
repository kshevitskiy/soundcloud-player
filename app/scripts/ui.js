const UI = {

	animation: {

		playPause: function(element) {
		    element
		        .stop()
		        .show()
		        .animate({'marginTop':'-30%', 'marginLeft':'-30%', 'width':'60%', 'height':'60%', 'opacity':'0'}, function() {
		            $(this).css({'width':'40%', 'height':'40%', 'margin-left':'-20%', 'margin-top':'-20%', 'opacity':'1', 'display':'none'});
		        });
		    element.parent().append(element);
		}
	},
}

export default {
    playAnimation: UI.animation.playPause
};