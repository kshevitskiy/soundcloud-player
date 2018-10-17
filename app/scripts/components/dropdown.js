const DROPDOWN = {	

	toggle () {		
		let $this = $(this),
			dropdown = $this.parent();

		dropdown.toggleClass('active');
		dropdown.on('mouseleave', function() {
			dropdown.removeClass('active');
		});
	},

	events (button) {
		button.on('click', DROPDOWN.toggle);
	},

	init () {
		DROPDOWN.events($('.dropdown-button'));
	}
}

export default {    
    init: DROPDOWN.init
}

