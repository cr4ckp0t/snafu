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
	if (command === 'assignToMe') {
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
					chrome.tabs.sendMessage(tabs[0].id, messageData, handleResponseBG);
				});
			}
		});
	} else {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: command}, handleResponseBG);
		});
	}
});

// receive messages to open tabs
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (isVarEmpty(msg.url) === false) {
		chrome.tabs.create({url: msg.url, active: false});
	}
});

// only activate the icon if service now is the active tab
chrome.runtime.onInstalled.addListener(function(details) {
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
	
	if (details.reason === 'install') {
		// show help page
		chrome.tabs.create({url: chrome.runtime.getURL('html/help.html')});
	} else if (details.reason === 'update') {
		// check for incorrect setting(s) and remove it/them
		chrome.storage.sync.get('labels', function(items) {
			if ('buildAck' in items.labels) {
				chrome.storage.sync.set({
					labels: {
						buildack: items.buildAck,
						buildAck: null
					}
				});
			}
		});
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
		'clearNotes',
		'closeAlerts',
		'remind',
		'buildLog',
		'decomLog',
		'repairLog',
		'builds',
		'decoms',
		'repairs',
		'labels',
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
			if (isVarEmpty(items.clearNotes) === true) settingsToCreate['clearNotes'] = true;
			if (isVarEmpty(items.closeAlerts) === true) settingsToCreate['closeAlerts'] = true;
			if (isVarEmpty(items.remind) === true) settingsToCreate['remind'] = 'open';
			if (isVarEmpty(items.buildLog) === true) settingsToCreate['buildLog'] = false;
			if (isVarEmpty(items.decomLog) === true) settingsToCreate['decomLog'] = false;
			if (isVarEmpty(items.repairLog) === true) settingsToCreate['repairLog'] = false;
			if (isVarEmpty(items.builds) === true) settingsToCreate['builds'] = {};
			if (isVarEmpty(items.decoms) === true) settingsToCreate['decoms'] = {};
			if (isVarEmpty(items.repairs) === true) settingsToCreate['repairs'] = {};
			if (isVarEmpty(items.labels) === true) {
				settingsToCreate['labels'] = {
					build: true,
					buildack: true,
					decommission: true,
					equipment: true,
					reclaim: true,
					reimage: true,
					reimageack: true,
					repair: true,
					restock: true
				}
			}
			if (isVarEmpty(items.canned) === true) {
				settingsToCreate['canned'] = {
					'callingUser': 'Calling {INC_CUST_FNAME} at {INC_CUR_PHONE}.',
					'leftVoicemail': 'Left voicemail for {INC_CUST_FNAME} at {INC_CUR_PHONE} to discuss the ticket.'
				}
			}
			if (settingsToCreate !== {}) {
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

// search provider listener
chrome.omnibox.onInputEntered.addListener(function(text) {
	chrome.tabs.create({url: sprintf('https://ghsprod.service-now.com/textsearch.do?sysparm_no_redirect=true&sysparm_search=%s', [text])});
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
function handleResponseBG(response) {
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

/**
 * Javascript sprintf function.
 * @param   {String}    template
 * @param   {String[]}  values
 * @return  {String}
 */
function sprintf(template, values) {
    return template.replace(/%s/g, function() {
        return values.shift();
    });
}