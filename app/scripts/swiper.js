// TODO. Use swiper slider in new player layout.
const SWIPER = {
	
	banner: function(slider) {
		var mySwiper = new Swiper(slider, {
			centeredSlides: true,
			spaceBetween: 0,
			slidesPerView: 1,
			effect: 'fade',
			pagination: {
				el: '.pagination',
				clickable: true,
			},
			fade: {
				crossFade: true
			}
		}); 
	},

	init: function() {
		SWIPER.banner('.banner');				
	}
}

export default {
    init: SWIPER.init    
};