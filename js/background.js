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

// keyboard shortcuts
chrome.commands.onCommand.addListener(function(command) {
	if (command === 'savePage' || command === 'updatePage') {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: command}, handleResponse);
		});
	} else if (command === 'assignToMe') {
		chrome.storage.sync.get(['debug', 'userId', 'fullName', 'groupId', 'groupName'], function(items) {
			if (chrome.runtime.lastError) {
				console.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
			} else {
				if (isVarEmpty(items.userId) === true || isVarEmpty(items.fullName) === true || isVarEmpty(items.groupId) === true || isVarEmpty(items.groupName) === true) {
					// query user info
					var messageData = {
						type: 'userQuery'
					}
				} else {
					// assign to technician
					var messageData = {
						type: 'assignToMe',
						userInfo: {
							userId: items.userId,
							fullName: items.fullName,
							groupId: items.groupId,
							groupName: items.groupName 
						}
					}
				}
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, messageData, handleResponse);
				});
			}
		});
	}
});

// only activate the icon if service now is the active tab
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

// show help page the when the extension is installed
chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason === 'install') {
		// show help page
		chrome.tabs.create({url: chrome.extension.getURL('help.html')});
	}
});

// create settings on startup, if they don't exist
chrome.runtime.onStartup.addListener(function() {
	chrome.storage.sync.get([
		'autoFinish',
		'finishDelay',
		'debug',
		'canned',
		'closePopup',
		'sendEnter',
		'keepNotes',
		'closeAlerts'
	], function(items) {
		if (chrome.runtime.lastError) {
			console.error('SNAFU: Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {
			var settingsToCreate = {}
			// create the settings
			if (isVarEmpty(items.autoFinish) === true) settingsToCreate['autoFinish'] = 'none';
			if (isVarEmpty(items.finishDelay) === true) settingsToCreate['finishDelay'] = 1.5;
			if (isVarEmpty(items.debug) === true) settingsToCreate['debug'] = false;
			if (isVarEmpty(items.closePopup) === true) settingsToCreate['closePopup'] = false;
			if (isVarEmpty(items.sendEnter) === true) settingsToCreate['sendEnter'] = true;
			if (isVarEmpty(items.keepNotes) === true) settingsToCreate['keepNotes'] = false;
			if (isVarEmpty(items.closeAlerts) === true) settingsToCreate['closeAlerts'] = true;
			if (isVarEmpty(items.canned) === true) {
				settingsToCreate['canned'] = {
					'callingUser': 'Calling {INC_CUST_FNAME} at {INC_CUR_PHONE}.',
					'leftVoicemail': 'Left voicemail for {INC_CUST_FNAME} at {INC_CUR_PHONE} to discuss the ticket.'
				}
			}
			if (isVarEmpty(settingsToCreate) === false) {
				chrome.storage.sync.set(settingsToCreate, function() {
					if (chrome.runtime.lastError) {
						console.warn('SNAFU Sync Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created settings successfully.');
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

/**
 * Handle the response from the sendMessage call for debugging purposes.
 * @param	{Object}	response
 * @return	{Void}
 */
function handleResponse(response) {
	chrome.storage.sync.get(['debug'], function(items) {
		if (chrome.runtime.lastError) {
			console.error('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {
			if (items.debug === true) {
				if (isVarEmpty(response) === false) {
					if (response.success === false) {
						console.error('SNAFU Error: %s', response.errMsg);
					} else {
						console.info('SNAFU: Update sent!');
					}
				} else {
					console.error('SNAFU Error: Unable to process response to message.');
				}
			}
		}
	});
}