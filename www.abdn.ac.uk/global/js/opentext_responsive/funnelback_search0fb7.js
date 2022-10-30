/**
 * Functions for Funnelback search integration
 *
 * Created 17 Aug 2018
 * Updated 07 Oct 2021
 *
 * Last updated: run landscape check after the page has fully loaded, DC.
 *
 * @author Allan A Beattie
 * @author Colin Denholm
 * @author Darren Coutts
 */


function setupFacetToggle() {
	// detect viewport width
	if ($(window).width() <= 940) {
		// make a wrapper
		var facet_toggle_wrapper = $('<div class="facet_toggle_wrapper active"></div>');

		// put it in place
		$('#search-result-count').before(facet_toggle_wrapper);

		// make the show/hide panel
		var hidey_div = $('<div id="facet_wrapper" class="facet_wrapper collapsed" style="display: none;"></div>');

		// put it in place
		facet_toggle_wrapper.append(hidey_div);

		// make the toggle button
		var facet_toggle = $('<button class="facet_toggle" aria-controls="facet_wrapper" aria-expanded="false">Refine your search</button>');

		// put it in place
		hidey_div.before(facet_toggle);

		// add the event handler
		facet_toggle.click(function() {
			if (hidey_div.hasClass('collapsed')) {
				hidey_div.removeClass('collapsed');
				facet_toggle.attr('aria-expanded', 'true');
				hidey_div.slideDown();
			}
			else {
				hidey_div.slideUp();
				setTimeout(function(){
					hidey_div.addClass('collapsed');
					facet_toggle.attr('aria-expanded', 'false');
				}, 401);
			}
		});

		// move the facets into the wrapper
		hidey_div.append($('.search_refine'));

		// hide the heading offscreen
		$('.search_refine h2').addClass('offscreen');
		$('.search_related').addClass('full');

		// create the "clear" button, hidden
		var facet_clear_wrapper = $('<div class="facet_clear_wrapper clearfix"></div>');
		var facet_clear_label_dl = $('<dl></dl>');
		var facet_clear_label_dt = $('<dt>Your Active Filter</dt>');
		var facet_clear_label = $('<dd class="facet_clear_label"></dd>');
		var facet_clear = $('<a href="#" class="facet_clear">Clear</a>');
		hidey_div.after(facet_clear_wrapper);
		facet_clear_wrapper.append(facet_clear_label_dl);
		facet_clear_label_dl.append(facet_clear_label_dt);
		facet_clear_label_dl.append(facet_clear_label);
		facet_clear_wrapper.append(facet_clear);

		// grab the "all" URL from the relevant facet
		var clear_url = $('.search_refine a.flaticon-all').attr('href');

		// asign to "clear" button
		facet_clear.attr('href', clear_url);

		// is there an active facet?
		if ($('.selected_facet').length) {
			// yarp; populate the "clear" button
			var selected_facet = $('#search-result-count .selected_facet').text();
			facet_clear_label.text(selected_facet);

			// show it
			facet_clear_wrapper.addClass('active');
		}
	}
}


function facetState() {
	// detect viewport width
	if ($(window).width() < 920) {
		// does the facet wrapper exist?
		if (!$('.facet_toggle_wrapper').length) {
			// nope; create it
			setupFacetToggle();
		}
		else {
			// is the facet wrapper visible?
			if (!$('.facet_toggle_wrapper').hasClass('active')) {
				// nope; move the things
				$('.facet_wrapper').append($('.search_refine'));
				$('.search_related').addClass('full');
				$('.search_refine h2').addClass('offscreen');
				$('.facet_toggle_wrapper').addClass('active');
			}
		}
	}
	else {
		// is the facet wrapper active?
		if ($('.facet_toggle_wrapper').hasClass('active')) {
			// yup; move the things
			$('.search_related').before($('.search_refine'));
			$('.search_related').removeClass('full');
			$('.search_refine h2').removeClass('offscreen');
			$('.facet_toggle_wrapper').removeClass('active');
		}
	}
}


$(document).ready(function() {
	// add typeahead to global search
	$('#global_search input').autocompletion({
		datasets: {
			organic: {
			collection: 'uoa-meta-all',
			profile: '_default_preview',
			program: 'https://uoab-search.squiz.cloud/s/suggest.json',
			dataType: 'json'
			},
		},
		length: 2
	});

	// add typeahead to big search box
	$('.hero_search form input').autocompletion({
		datasets: {
			organic: {
			collection: 'uoa-meta-all',
			program: 'https://uoab-search.squiz.cloud/s/suggest.json',
			dataType: 'json'
			},
		},
		length: 2
	});

	// set up the facet toggle wrapper
	facetState();

	// watch the window resize event
	$(window).resize(function() {
		facetState();
	});
});

$(window).on('load', function () {
	// staff profile photo aspect ratio
	$('.people_img img').each(function () {
		if ($(this).width() > $(this).height()) {
			$(this).parent().addClass('landscape');
		}
	});
});
