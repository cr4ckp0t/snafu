/**
 *  SNAFU: SNow Automated Form Utilizer
 *  Copyright (C) 2019  Adam Koch <adam.koch@prismahealth.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

$(document).ready(function() {
	$('#version').html(chrome.app.getDetails().version);
	$('#versionAbout').html(chrome.app.getDetails().version);
	$('#openAll').click(function() { $('[id^=collapse]').collapse('show'); });
	$('#closeAll').click(function() { $('[id^=collapse]').collapse('hide'); });
	$('#toggleAll').click(function() { $('[id^=collapse]').collapse('toggle'); });
	$('#openHelp').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/help.html')}); });
	$('#openOptions').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/options.html')}); });
	$('#openChangelog').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/changelog.html')}); });
	$('#closeWindow').click(function() { chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { chrome.tabs.remove(tabs[0].id); }); });
});