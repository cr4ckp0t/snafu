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

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason === 'install') {
		// show help page
		chrome.tabs.create({url: chrome.extension.getURL('help.html')});
	}
});

chrome.runtime.onStartup.addListener(function() {
	chrome.storage.sync.get(['autoFinish'], function(items) {
		if (chrome.runtime.lastError) {
			console.warn('SNAFU: Sync Get Error: %s', chrome.runtime.lastError.message);
		} else if (!items.autoFinish) {
			chrome.storage.sync.set({autoFinish: 'none'}, function() {
				if (chrome.runtime.lastError) {
					console.warn('SNAFU: Sync Set Error: %s', chrome.runtime.lastError.message);
				} else {
					console.info('SNAFU: Initialized Settings');
				}	
			});
		}
	});
});