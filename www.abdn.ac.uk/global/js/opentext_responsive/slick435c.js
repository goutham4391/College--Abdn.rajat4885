/**
 * Initialise various flavours of Slick carousel
 *
 * This file is in version control:
 * https://github.com/uofa/global-environment/
 *
 * Created 10 Feb 2017
 * Updated 24 Apr 2020
 *
 * Last update: manage focus of iframes, MC.
 *
 * @author Allan A Beattie
 * @author Colin Denholm
 * @author Matthew Colbourne
 */


// user has not interacted, so autoplay
var stop_slideshow = false;

// desktop default
var start_autoplay = true;

var is_mobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
if (is_mobile) {
	start_autoplay = false;
	stop_slideshow = true; // never start no matter what
}

(function() {
	function loadAndInitSlick(obj) {
		if (obj.hasClass('slick_slideshow')) {
			var $slider = obj;
			$slider.removeClass('slick_not_loaded');

			$slider.on('init', function(event, slick) {
				$(this).find('.slick-dots > li > button').addClass('slideshow_dot');
			});

			// On before slide change
			$slider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
				// slideshow Index is the count of slideshows on the page in order of creation
				var slideshowIndex = slick.instanceUid.toString();
				var fromSlide = document.getElementById('slick-slide' + slideshowIndex + currentSlide.toString());
				var toSlide = document.getElementById('slick-slide' + slideshowIndex + nextSlide.toString());

				// turn off the tab index of from slide
				$(fromSlide).find('iframe').attr('tabindex', '-1');

				// turn on the tab index of to slide
				$(toSlide).find('iframe').attr('tabindex', '0');
			});


			$slider.slick({
				autoplay: start_autoplay,
				autoplaySpeed: 7000,
				dots: true,
				fade: true,
				infinite: true,
				adaptiveHeight: true,
				speed: 500,
				pauseOnFocus: true,
				accessibility: true
			});

			// pause slideshow if user has started navigating - dots and arrows
			$('.slick_slideshow button').click(function() {
				stop_slideshow = true;
			});

			$('.slick_slideshow button').keypress(function (e) {
				if (e.keyCode === 13) {
					$slider.slick('slickPause');
					stop_slideshow = true;
				}
			});

			$slider.hover(function() {
				$slider.slick('slickPause');
			},
			function() {
				if (!stop_slideshow) {
					$slider.slick('slickPlay');
				}
			});

			// loop through the articles
			$slider.find('article').each(function() {
				// we need an overlay to detect clicks on the videos
				var video_title = $(this).find('iframe').attr('title');
				$(this).find('.video_container').prepend('<a class="video_overlay" href="#">Play ' + video_title + '</a>');
				$(this).find('.video_overlay').css('z-index', '2').attr('tabindex', '-1');
				$(this).find('iframe').css('z-index', '1').attr('tabindex', '-1');

				$(this).find('.video_overlay').click(function(e) {
					e.preventDefault();

					// stop the slideshow from playing, even onmouseout and scroll away and then back
					stop_slideshow = true;

					// remove overlay
					$(this).css('display', 'none');

					// which iframe?
					var active_iframe = $(this).next();

					// what kind of video
					var video_src = active_iframe.attr('src');

					// play the video
					if (video_src.indexOf('youtube') > -1 || video_src.indexOf('vimeo') > -1) {
						// add ? if not appending parameters
						if (video_src.indexOf('?') === -1) {
							video_src += '?';
						}
						else {
							video_src += '&';
						}

						video_src += 'autoplay=1';
					}

					if (video_src.indexOf('kaltura') >= 0) {
						video_src += '&flashvars[autoPlay]=true';
					}

					active_iframe.attr('src', video_src);
				});
			});

			//  turn on iframe of first slide
			var the_overlays = $slider.find('article .video_overlay');
			$(the_overlays[0]).attr('tabindex', '0');
			var iframes = $slider.find('article iframe');
			$(iframes[0]).attr('tabindex', '0');

			initStats($slider);
		}
		else if (obj.hasClass('slick_carousel') || obj.hasClass('slick_gallery')) {
			var medium = 1100;
			if ($('.full_width').length > 0) {
				var medium = 940;
			}

			var $slider = obj;
			$slider.removeClass('slick_not_loaded');

			$slider.slick({
				autoplay: false,
				autoplaySpeed: 3000,
				dots: true,
				slidesToShow: 3,
				slidesToScroll: 3,
				speed: 500,
				responsive: [{
					breakpoint: 1240,
					settings: {
						slidesToShow: 3,
						slidesToScroll: 3
					}
				}, {
					breakpoint: medium,
					settings: {
						slidesToShow: 2,
						slidesToScroll: 2
					}
				}, {
					breakpoint: 600,
					settings: {
						slidesToShow: 1,
						slidesToScroll: 1
					}
				}]
			});
		}
		else if (obj.hasClass('gallery_area')) {
			$current_gallery = obj;
			$current_gallery.attr('id', 'gallery_' + increment);

			var $slider = $current_gallery.find('.slider.slick_not_loaded');
			$slider.removeClass('slick_not_loaded');

			// progressively enhance
			$current_gallery.find('.slider_nav').css('display', 'block');

			// create stats and control button
			var $the_parent = $current_gallery.parent();
			var $controls_wrapper = $(document.createElement('div')).addClass('slideshow_controls_wrapper').appendTo($the_parent);
			$(document.createElement('button')).addClass('slideshow_controls').html('Play').appendTo($controls_wrapper);

			initStats($current_gallery);

			$current_gallery.find('.slider_for').slick({
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
				fade: true,
				adaptiveHeight: false,
				asNavFor: '.slider_nav'
			});

			$current_gallery.find('.slider_nav').slick({
				slidesToShow: ($(".news_item").length > 0 || $(".syndicated_details").length > 0) ? 2 : 5,
				slidesToScroll: 1,
				asNavFor: '.slider_for',
				centerMode: true,
				focusOnSelect: true,
				responsive: [{
					breakpoint: 1200,
					settings: {
						slidesToShow: 5
					}
				}, {
					breakpoint: 940,
					settings: {
						slidesToShow: ($(".news_item").length > 0 || $(".syndicated_details").length > 0) ? 2 : 5
					}
				}, {
					breakpoint: 800,
					settings: {
						slidesToShow: 4
					}
				}, {
					breakpoint: 600,
					settings: {
						slidesToShow: 3
					}
				}, {
					breakpoint: 500,
					settings: {
						slidesToShow: 2
					}
				}, {
					breakpoint: 300,
					settings: {
						slidesToShow: 1
					}
				}]
			});

			initLightboxGallery($current_gallery);
			initGalleryControls($current_gallery.parent());
			increment ++;
		}
		else if (obj.hasClass('slider_homepage')) {
			var $slider = obj;
			$slider.removeClass('slick_not_loaded');

			$slider.on('init', function(event, slick) {
			 	var $img = $(slick.$slides.get(0)).find('img');
			 	$('.slider_homepage_wrapper_overlay').css({'background-image': 'url(' + $img.attr('src') + ')'});
			});

			$slider.slick({
				autoplay: true,
				autoplaySpeed: 7000,
				dots: true,
				fade: true,
				infinite: true,
				adaptiveHeight: true,
				speed: 500,
				responsive: [{
					breakpoint: 780,
					settings: {
						arrows: false
					}
				}]
			});

			// pause slideshow if user has started navigating - dots and arrows
			$('.slider_homepage button').click(function() {
				stop_slideshow = true;
			});

			$('.slider_homepage button').keypress(function (e) {
				if (e.keyCode === 13) {
					$slider.slick('slickPause');
					stop_slideshow = true;
				}
			});

			$slider.hover(function() {
				$slider.slick('slickPause');
			},
			function() {
				if (!stop_slideshow) {
					$slider.slick('slickPlay');
				}
			});

			initStats($slider);

			$slider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
			 	var $img = $(slick.$slides.get(nextSlide)).find('img');
			 	setTimeout(function() {
			 		$('.slider_homepage_wrapper_overlay').css({'background-image': 'url(' + $img.attr('src') + ')'});
			 	}, 1);
			});
		}
    }

    $(document).ready(function() {
    	if (jQuery().slick) {
			increment = 1;

			// do any slideshows exist?
			$('.slick_slideshow').each(function(index) {
				// add a parent div
				$(this).wrap('<div></div>');
				$(this).parent().attr('aria-label', 'slideshow_' + increment);

				loadAndInitSlick($(this));
				increment ++;
			});

			// do any carousels exist?
			$('.slick_carousel').each(function(index) {
				loadAndInitSlick($(this));
				increment ++;
			});

			// do any carousel galleries exist?
			if ($('.slick_gallery').length || $('.gallery_area').length || $('.zoomable').length) {
				// bring in external javascript
				$.getScript('https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/jquery.magnific-popup.js', function() {
					// only start slick_gallery once external script loaded
					$('.slick_gallery').each(function(index) {
						loadAndInitSlick($(this));
						initLightboxGallery($(this));

						increment ++;
					});

					$('.gallery_area').each(function(index) {
						loadAndInitSlick($(this));
						initLightboxGallery($(this));

						increment ++;
					});

					$('.zoomable').each(function(index) {
						initLightboxGallery($(this));
					});
				});
			}

			// pause all slideshows when offscreen
			if ($('.slick_slideshow').length > 0) {
				$(window).scroll(function() {
					$('.slick_slideshow').each(function() {
						if ($(window).scrollTop() > $(this).offset().top + $(this).height()) {
							$(this).slick('slickPause');
						}
						else {
							if (!stop_slideshow) {
								$(this).slick('slickPlay');
							}
						}
					});
				});

				// do the same onload
				$('.slick_slideshow').each(function() {
					if ($(window).scrollTop() > $(this).offset().top + $(this).height()) {
						$(this).slick('slickPause');
					}
					else {
						if (!stop_slideshow) {
							$(this).slick('slickPlay');
						}
					}
				});
			}

			// homepage slideshow
			$('.slider_homepage').each(function(index) {
				// add a parent div
				$(this).wrap('<div></div>');
				$(this).parent().attr('aria-label', 'slideshow_' + increment);
				loadAndInitSlick($(this));
				increment ++;
			});
    	}
    });
})();


// add stats
function initStats(obj) {
	var $the_parent = obj.parent();

	// check if there's already a wrapper div
	var $controls_wrapper = $the_parent.find('.slideshow_controls_wrapper');

	if ($controls_wrapper.length == 0) {
		var $controls_wrapper = $(document.createElement('div')).addClass('slideshow_controls_wrapper').appendTo($the_parent);
	}

	// visually hide all but the gallery version of the stats
	if (!obj.hasClass('gallery_area')) {
		$controls_wrapper.addClass('offscreen');
	}

	var $the_stats = $(document.createElement('div')).addClass('slideshow_stats').appendTo($controls_wrapper);

	if (obj.hasClass('slick-slider')) {
		var $the_slider = obj;
	}
	else {
		var $the_slider = obj.find('.slider').eq(0);
	}

	$the_slider.on('focus', 'button', function(event) {
		$the_stats.attr('aria-live', 'polite');
	});

	$the_slider.on('blur', 'button', function(event) {
		$the_stats.removeAttr('aria-live');
	});

	$the_slider.on('init reInit afterChange', function(event, slick, currentSlide, nextSlide) {
		// currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
		var i = (currentSlide ? currentSlide : 0) + 1;
		$the_stats.text('Image ' + i + ' of ' + slick.slideCount);
	});
}

// play and pause button for gallery and news slideshows
function initGalleryControls(obj) {
	var the_nav = obj.find('.slider_nav');

	if (the_nav.length > 0) {
		obj.find('.slideshow_controls').click(function() {
			if ($(this).html() == 'Play') {
				the_nav.slick('slickPlay');
				$(this).html('Pause');
			}
			else {
				$(this).html('Play');
				the_nav.slick('slickPause');
			}
		});
	}
}


function initLightboxGallery(obj) {
	obj.find('a.lightbox').magnificPopup({
		type: 'image',
		tLoading: 'Loading image #%curr%...',
		mainClass: 'mfp-img-mobile',
		gallery: {
			enabled: true,
			navigateByImgClick: true
		},
		image: {
			tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
			titleSrc: function(item) {
				lightboxTitle = '';
				if (item.el.attr('title') && item.el.attr('title').length > 0) {
					lightboxTitle = '<span id="lightboxTitle">' + item.el.attr('title') + '</span>';
				}

				lightboxDescription = '';
				if (item.el.attr('data-caption') && item.el.attr('data-caption').length > 0) {
					lightboxDescription = '<small id="lightboxDescription">' + item.el.attr('data-caption') + '</small>';
				}

				return lightboxTitle + lightboxDescription;
			}
		}
	});

	$('.slider a.lightbox').on('mfpOpen', function(e) {
		// Implement aria roles
		$('.mfp-content').attr('aria-live', 'polite');
		$('.mfp-content').attr('role', 'dialog');
		$('.mfp-content').attr('aria-labelledby', 'lightboxTitle');
		$('.mfp-content').attr('aria-describedby', 'lightboxDescription');
		$('.slider').slick('slickPause');
		$('.slider_nav').slick('slickPause');
		$('.slideshow_controls').html('Play');
	});
}