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

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'ghsprod.service-now.com'}
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason === 'install') {
		// show help page
		chrome.tabs.create({url: chrome.extension.getURL('help.html')});
	}
});

chrome.runtime.onStartup.addListener(function() {
	chrome.storage.sync.get(['autoFinish', 'finishDelay', 'debug', 'canned', 'closePopup', 'sendEnter', 'monitorGroup', 'assignGroup', 'monInterval'], function(items) {
		if (chrome.runtime.lastError) {
			console.error('SNAFU: Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {
			if (isVarEmpty(items.autoFinish) === true) {
				chrome.storage.sync.set({autoFinish: 'none'}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU autoFinish Set Error: %s', chrome.runtime.lastError.message);
					}
				});
			}

			if (isVarEmpty(items.finishDelay) === true) {
				chrome.storage.sync.set({finishDelay: 1.5}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU finishDelay Set Error: %s', chrome.runtime.lastError.message);
					}
				});
			}

			if (isVarEmpty(items.debug) === true) {
				chrome.storage.sync.set({debug: false}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU debug Set Error: %s', chrome.runtime.lastError.message);
					}
				});
			}

			if (isVarEmpty(items.canned) === true) {
				chrome.storage.sync.set({
					canned: {
						'callingUser': 'Calling {INC_CUST_FNAME} at {INC_CUR_PHONE}.',
						'leftVoicemail': 'Left voicemail for {INC_CUST_FNAME} at {INC_CUR_PHONE} to discuss the ticket.'
					}
				}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU canned Set Error: %s', chrome.runtime.lastError.message);
					}
				});
			}

			if (isVarEmpty(items.closePopup) === true) {
				chrome.storage.sync.set({closePopup: false}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU closePopup Set Error: %s', chrome.runtime.lastError.message);
					}
				});
			}

			if (isVarEmpty(items.sendEnter) === true) {
				chrome.storage.sync.set({sendEnter: true}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU sendEnter Set Error: %s', chrome.runtime.lastError.message);
					}
				});
			}

			if (isVarEmpty(items.monitorGroup) === true) {
				chrome.storage.sync.set({monitorGroup: false}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU monitorGroup Set Error: %s', chrome.runtime.lastError.message);
					}
				});
			}

			if (isVarEmpty(items.assignGroup) === true) {
				chrome.storage.sync.set({assignGroup: '7d8ea2206fcaf60449bfd4a21c3ee406'}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU assignGroup Set Error: %s', chrome.runtime.lastError.message);
					}
				});
			}

			if (isVarEmpty(items.monitorInterval) === true) {
				chrome.storage.sync.set({monitorInterval: 3}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU monitorInterval Set Error: %s', chrome.runtime.lastError.message);
					}
				});
			}
		}
	});
});

/**
 * Checks if a variable is empty (null, undefined, NaN, etc.).
 * @param   {String}    value
 * @return  {Boolean}
 */
function isVarEmpty(value) {
    return (value === null || value === undefined || value === NaN || value.toString().trim() === '') ? true : false
}