/**
 * JavaScript functions for archive calendar
 *
 * Created 14 Mar 2011
 * Updated 07 Oct 2020
 *
 * Last update: amend calendar widget function to use browse button.
 *
 * @author Allan A Beattie
 */

// progressively enhance the year select - assuming there is one
var calendar_year_form = document.querySelector('.calendar_widget form');
if (calendar_year_form && calendar_year_form.addEventListener) {
    calendar_year_form.addEventListener('submit', function (e) {
        e.preventDefault();
        var the_select = this.querySelector('select');
        archiveCalendarSwitch(the_select.options[the_select.selectedIndex].value);
        return false;
    });
}

// progressively enhance the search button
var search_widget_input = document.getElementById('kw');
if (search_widget_input && search_widget_input.addEventListener) {
    search_widget_input.addEventListener('keyup', function (e) {
        this.parentNode.getElementsByTagName('button')[0].className = (this.value != '' ? 'active' : '');
    });
}

function archiveCalendarSwitch(archive_year)
{
    // find the archive calendar on the page
    var the_calendar = document.getElementById('archive_controls');

    // find the currently displayed calendar
    var the_archive_years = the_calendar.getElementsByTagName('div');
    for (var i = 0; i < the_archive_years.length; i++) {
        if (the_archive_years[i].className.search('active') != -1) {
            var current_calendar = the_archive_years[i];
            break; // found it, no need to continue
        }
    }

    current_calendar.className += ' faded';

    selected_calendar = document.getElementById('calendar_' + archive_year).parentNode;
    selected_calendar.className += ' faded';

    // show the loader for a moment...
    setTimeout(function () {
        current_calendar.className = current_calendar.className.replace(' faded', ' offscreen');
        current_calendar.className = current_calendar.className.replace(' active', '');
        current_calendar.setAttribute('aria-hidden', 'true');

        selected_calendar.className = selected_calendar.className.replace(' offscreen', ' active');
        selected_calendar.className = selected_calendar.className.replace(' faded', '');
        selected_calendar.setAttribute('aria-hidden', 'false');
    }, 750);

    document.getElementById('currently_viewing').innerHTML = 'You are currently viewing the calendar for ' + archive_year;

    // stop the default link behaviour
    return false;
}
