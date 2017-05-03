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
	$('#snafu-version').html(chrome.app.getDetails().version);
	$('#alertSuccess').hide();
	$('#alertFailure').hide();

	loadSettings();

	$('#saveSettings').click(function() {
		chrome.storage.sync.set({
			debug: ($('#debugMode').val() === 'enable') ? true : false
		}, function() {
			if (chrome.runtime.lastError) {
				$('#alertFailureMsg').text('Failed to save settings.');
				$('#alertFailure').show();
				console.warn('SNAFU Sync Set Error: %s', chrome.runtime.lastError.message);
			} else {
				$('#alertSuccessMsg').text('Settings saved successfully.');
				$('#alertSuccess').show();
			}
		});
	});

	$('#closeWindow').click(function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.remove(tabs[0].id);
		});
	});
});

function loadSettings() {
	chrome.storage.sync.get(['debug'], function(items) {
		if (chrome.runtime.lastError) {
			console.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {
			$('#debugMode').val((items.debug === true) ? 'enable' : 'disable');
		}
	});
}