/**
 *  SNAFU: SNow Automated Form Utilizer
 *  Copyright (C) 2017  Adam Koch <akoch@ghs.org>
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
	$('#versionAbout').html(chrome.app.getDetails().version);
	$('#viewOnline').click(function() { chrome.tabs.create({url: 'https://adamko.ch/snafu'}); });
	$('#viewOnlineSafe').click(function() { chrome.tabs.create({url: 'https://adamkoch.squarespace.com/snafu'}); });
	$('#openHelp').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/help.html')}); });
	$('#openOptions').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/options.html')}); });
	$('#openFaq').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/faq.html')}); });
	$('#closeWindow').click(function() { chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { chrome.tabs.remove(tabs[0].id); }); });

	var reader = new FileReader()
	reader.onloadend = function(e) {
		console.log(e.target.result);
	}

	// since we use jquery for the backbone of the extension, why not use it to read the changelog!
	$.ajax({
		method: 'GET',
		url: chrome.runtime.getURL('CHANGELOG.md')
	})
		.done(function(text) {
			var converter = new showdown.Converter();
			$('#changelogText').html(converter.makeHtml(text));
		});
});