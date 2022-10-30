/**
 * JavaScript functions for global FAQs
 *
 * This file is in version control:
 * https://github.com/uofa/global-environment
 *
 * Created 12 Oct 2012
 * Updated 29 Jan 2021
 *
 * Last update: ensure all IDs are unique, AB.
 *
 * @author Allan A Beattie
 * @author Colin Denholm
 */


var used_ids = new Array();
var count = 1;

if (!url_fragments) {
	var url_fragments = 'on';
}


/**
 * Function to check if variable passed is an array
 *
 * Thanks to Andrew Peace <http://www.andrewpeace.com/javascript-is-array.html>
 */
function is_array(input) {
	return typeof(input) == 'object' && (input instanceof Array);
}


/**
 * Function to check if a variable passed is in the passed array
 */
function in_array(needle, haystack) {
	// make sure haystack is an array
	if (!is_array(haystack)) {
		return false;
	}

	// iterate through the haystack
	for (var key = 0; key < haystack.length; key ++) {

		// does this haystack value match the needle?
		if (haystack[key] == needle) {

			// yes
			return true;
		}
	}

	// needle is not in haystack
	return false;
}


function nu_trim(x) {
	return x.replace(/^\s+|\s+$/gm,'');
}


// make tables with class faq_table dynamically expandable
function showHideFAQSetup(the_table, open_first) {
	if (the_table) {
		prepareFAQTable(the_table);
	}
	else {
		// collapsing all tables
		var all_tables = document.getElementsByTagName('table');

		for (var t = 0; t < all_tables.length; t ++) {
			var the_table = all_tables[t];

			if (the_table.className == 'faq_table') {
				prepareFAQTable(the_table)
			}
		}

		// optional - expand the first of each table
		if (open_first) {
			for (var t = 0; t < all_tables.length; t ++) {
				var the_table = all_tables[t];

				if (the_table.className == 'faq_table') {
					var the_cells = the_table.getElementsByTagName('td');
					the_cells[0].parentNode.className = 'active_faq';
					the_cells[0].parentNode.setAttribute('aria-hidden', 'false');

					var the_headings = the_table.getElementsByTagName('th');
					the_headings[0].parentNode.className = 'clickable_faq_active';
					the_headings[0].parentNode.setAttribute('aria-hidden', 'false');
				}
			}
		}
	}

	// if a hash exists, fake a click of that row
	if (location.hash) {
		var row_id = location.hash.substr(1);
		if (document.getElementById(row_id)) {
			document.getElementById(row_id).click();
		}
	}
}


function prepareFAQTable(the_table) {
	var the_cells = the_table.getElementsByTagName('td');
	for (var i = 0; i < the_cells.length; i ++) {
		this_cells_parent = the_cells[i].parentNode;
		if (this_cells_parent.parentNode.parentNode == the_table || this_cells_parent.parentNode.parentNode.parentNode == the_table) {
			this_cells_parent.className = 'hidden';
			this_cells_parent.setAttribute('aria-hidden', 'true');
		}
	}

	/**
	 * We wrap questions in heading tags, but which heading level to start at?
	 * Find the parent, then detect headings inside the parent element.
	 */
	var the_parent = the_table.parentNode;
	var all_children = the_parent.childNodes;

	var previous_heading = '';
	for (var i = 0; i < all_children.length; i ++) {
		if (all_children[i].tagName) {
			if (all_children[i].tagName.search(/^H[1-6]{1}$/) !== -1) {
				previous_heading = all_children[i].tagName;
			}

			if (all_children[i] == the_table) {
				break;
			}
		}
	}

	var heading_level = parseInt(previous_heading.substr(1, 1));
	if (!heading_level) {
		heading_level = 1;
	}

	if (heading_level < 6) {
		heading_level ++;
	}

	var the_headings = the_table.getElementsByTagName('th');
	for (var i = 0, im = the_headings.length; i < im; i ++) {
		// we need to know if these headings belong to the FAQ table
		if (the_headings[i].parentNode.parentNode == the_table || the_headings[i].parentNode.parentNode.parentNode == the_table) {
			this_heading = the_headings[i];

			// add a bespoke class to aid tracking via google tag manager
			// this_heading.className = 'clickable_faq_heading';

			// event handler should maybe be done differently...
			this_heading.onclick = function() {
				showHideFAQ(this);
			};

			this_heading.onkeydown = function(e) {
				// define current, previous and next (possible) tabs
				var current = this;
				var prev;
				var next;
				var target;

				// find position
				for (var j = 0, jm = the_headings.length; j < jm; j ++) {
					if (current == the_headings[j]) {
						if (j >= 1) {
							prev = the_headings[(j - 1)];
						}

						if (j <= (the_headings.length - 2)) {
							next = the_headings[(j + 1)];
						}

						break;
					}
				}

				// find the direction (prev or next)
				switch (e.keyCode) {
					case 37:
						target = prev;
					break;

					case 39:
						target = next;
					break;

					default:
						target = false;
					break;
				}

				if (target) {
					showHideFAQ(target);
				}
				else {
					if (e.keyCode == 13) {
						showHideFAQ(this);
					}
				}
			};

			this_heading.parentNode.className = 'clickable_faq';
			this_heading.setAttribute('tabindex', '0');

			th_id = 'faq' + count;
			cell_id = 'faq' + count + '_content';
			count ++;

			// give the associated row an id for the aria-controls attribute
			if (this_heading.parentNode.nextElementSibling) {
				this_heading.parentNode.nextElementSibling.setAttribute('id', cell_id);
			}

			// add the unique id attribute for the heading so the browser can scroll to it
			this_heading.setAttribute('id', th_id);
			this_heading.setAttribute('aria-controls', cell_id);
			this_heading.setAttribute('aria-expanded', 'false');

			// mark them up as headings, assuming they aren't already
			if (this_heading.innerHTML.search(/<h[1-6]{1}/i) == -1) {
				this_heading.innerHTML = '<h' + heading_level + ' class="clickable_faq_heading">' + the_headings[i].innerHTML + '</h' + heading_level + '>';
			}
			else {
				// apply the class to all headings found in the cell
				var possible_headings = ['h2', 'h3', 'h4', 'h5', 'h6'];
				for (var j = 0; j < possible_headings.length; j ++) {
					var heading_tags = this_heading.getElementsByTagName(possible_headings[j]);
					if (heading_tags) {
						for (var k = 0; k < heading_tags.length; k ++) {
							heading_tags[k].className = 'clickable_faq_heading';
						}
					}
				}
			}
		}
	}
}


function showHideFAQ(what) {
	// get the row containing the heading just clicked
	var the_row = what.parentNode;

	// need 2 levels up as 1 level up is tbody (even if it's not declared)
	var the_table = the_row.parentNode.parentNode;
	var all_rows = the_table.getElementsByTagName('tr');

	for (var i = 0; i < all_rows.length; i ++) {
		this_row = all_rows[i];

		// if this is the row just clicked...
		if (the_row == this_row) {
			// the row containing the content will be...
			var next_row = all_rows[(i + 1)];

			// if the next row is showing...
			if (next_row.className == 'active_faq') {
				// hide it
				next_row.className = 'hidden';
				next_row.setAttribute('aria-hidden', 'true');
				next_row.setAttribute('tabindex', '-1');
				this_row.className = 'clickable_faq';
				what.setAttribute('aria-expanded', 'false');
			}
			else {
				// collapse all FAQ tables on the page (why?)
				var all_tables = document.getElementsByTagName('table');

				for (var t = 0; t < all_tables.length; t ++) {
					var hiding_the_tables = all_tables[t];

					if (hiding_the_tables.className == 'faq_table') {
						var the_cells = hiding_the_tables.getElementsByTagName('td');

						for (var j = 0; j < the_cells.length; j ++) {
							if (the_cells[j].parentNode.parentNode.parentNode == hiding_the_tables) {
								the_cells[j].parentNode.className = 'hidden';
								the_cells[j].parentNode.setAttribute('aria-hidden', 'true');
								the_cells[j].parentNode.setAttribute('tabindex', '-1');
							}
						}

						var the_headings = hiding_the_tables.getElementsByTagName('th');
						for (var j = 0; j < the_headings.length; j ++) {
							if (the_headings[j].parentNode.parentNode.parentNode == hiding_the_tables) {

								the_headings[j].onclick = function() {
									showHideFAQ(this);
								};

								the_headings[j].parentNode.className = 'clickable_faq';
								the_headings[j].setAttribute('aria-expanded', 'false');
							}
						}
					}
				}

				next_row.className = 'active_faq';
				next_row.setAttribute('aria-hidden', 'false');
				next_row.setAttribute('tabindex', '0');

				this_row.className = 'clickable_faq_active';
				what.focus();
				what.setAttribute('aria-expanded', 'true');

				if (url_fragments == 'on') {
					if (window.history.pushState) {
						window.history.pushState('row_clicked', 'Title', '#' + all_rows[i].children[0].id);
					}
				}

				// get the coordinates of the clicked row
				var row_top = all_rows[i].getBoundingClientRect().top;
				if (row_top < 0) {
					window.scrollBy(0, row_top);
				}
			}
		}
		else {
			if (all_rows[i].parentNode == the_table) {
				var this_row = all_rows[i];
				var next_row = all_rows[(i + 1)];
				if (next_row) {
					if (next_row.className == 'active_faq') {
						next_row.className = 'hidden';
						next_row.setAttribute('aria-hidden', 'true');
						next_row.setAttribute('tabindex', '-1');
						this_row.className = 'clickable_faq';
						what.setAttribute('aria-expanded', 'false');
					}
				}

				if (url_fragments == 'on') {
					if (window.history.replaceState) {
						window.history.replaceState('row_clicked', 'Title', '');
					}
				}
			}
		}
	}
}