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
	$('[id$=Success').hide();
	$('[id$=Failure').hide();

	$('#saveSettings').click(function() { saveSettings(); })
	$('#reloadData').click(function() { 
		loadSettings();
		successMessage('Reloaded settings successsfully.');
	});

	$('#closeWindow').click(function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.remove(tabs[0].id);
		});
	});
	$('#versionAbout').html(chrome.app.getDetails().version);
	$('#openFaq').click(function() { chrome.tabs.create({url: chrome.extension.getURL('faq.html')}); });
	$('#openHelp').click(function() { chrome.tabs.create({url: chrome.extension.getURL('help.html')}); });

	// reset user data
	$('#resetUser').click(function() {
		chrome.storage.sync.remove(['userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId'], function() {
			if (chrome.runtime.lastError) {
				console.error('SNAFU Sync Remove Error: %s', chrome.runtime.lastError.message);
				errorMessage('Failed to remove user data.');
			} else {
				if (debug === true) {
					console.info('SNAFU: Removed user data.');
				}
				successMessage('Successfully removed user data.');
			}
		});
	});

	// reset all settings
	$('#resetAll').click(function() {
		chrome.storage.sync.clear(function() {
			if (chrome.runtime.lastError) {
				console.error('SNAFU Sync Clear Error: %s', chrome.runtime.lastError.message);
				errorMessage('Failed to clear settings.');
			} else {
				if (debug === true) {
					console.info('SNAFU: Cleared all settings.');
				}
				successMessage('Successfully cleared all settings.');
				loadSettings();
			}
		});
	});

	loadSettings();
});

/**
 * Save settings from chrome.storage.sync.
 * @return	{Void}
 */
function saveSettings() {
	chrome.storage.sync.set({
		debug: ($('#debugMode').val() === 'enable') ? true : false,
		closePopup: ($('#closePopup').val() === 'enable') ? true: false,
		sendEnter: ($('#sendEnter').val() === 'enable') ? true : false,
		canned: getCannedMessages(),
		autoFinish: $('#ticketCompletion').val(),
		finishDelay: $('#finishDelay').val(),
		monitorGroup: ($('#monitorGroup').val() === 'enable') ? true : false,
		assignGroup: $('#assignGroup').val(),
		monitorInterval: $('#monitorInterval').val()
	}, function() {
		if (chrome.runtime.lastError) {
			console.error('SNAFU Sync Set Error: %s', chrome.runtime.lastError.message);
			errorMessage('Failed to save settings.');
		} else {
			successMessage('Settings saved successfully.');
		}
		loadSettings();
	});
}

/**
 * Load settings from chrome.storage.sync.
 * @return	{Void}
 */
function loadSettings() {
	chrome.storage.sync.get(['debug', 'closePopup', 'canned', 'autoFinish', 'finishDelay', 'sendEnter', 'userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId', 'monitorGroup', 'assignGroup', 'monitorInterval'], function(items) {
		if (chrome.runtime.lastError) {
			console.error('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {
			// debug settings
			if (isVarEmpty(items.debug) === true) {
				chrome.storage.sync.set({debug: false}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU debug Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created debug setting.');
					}
				});
				$('#debugMode').val('disable');
				debug = false;
			} else {
				$('#debugMode').val((items.debug === true) ? 'enable' : 'disable');
				debug = items.debug;
			}

			// close popup on submit
			if (isVarEmpty(items.closePopup) === true) {
				chrome.storage.sync.set({closePopup: false}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU closePopup Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created closePopup setting.');
					}
				});
				$('#closePopup').val('disable');
			} else {
				$('#closePopup').val((items.closePopup === true) ? 'enable' : 'disable');
			}
			
			// canned messages
			if (isVarEmpty(items.canned) === true) {
				chrome.storage.sync.set({
					canned: {
						'callingUser': 'Calling {INC_CUST_FNAME} at {INC_CUR_PHONE}.',
						'leftVoicemail': 'Left voicemail for {INC_CUST_FNAME} at {INC_CUR_PHONE} to discuss the ticket.'
					}
				}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU canned Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created canned messages.');
					}
				});
			} else {
				var cannedMsgs = '';
				for (var key in items.canned) {
					if (!items.canned.hasOwnProperty(key)) continue;
					cannedMsgs = cannedMsgs + ('{KEY}|{VALUE}\n').replace('{KEY}', key).replace('{VALUE}', items.canned[key]);
				}
				$('#cannedMsgs').text(cannedMsgs);
			}

			// auto finish
			if (isVarEmpty(items.autoFinish) === true) {
				chrome.storage.sync.set({autoFinish: 'none'}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU autoFinish Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created autoFinish setting.');
					}
				});
				$('#ticketCompletion').val('none');
			} else {
				$('#ticketCompletion').val(items.autoFinish);
			}

			// finish delay
			if (isVarEmpty(items.finishDelay) === true) {
				chrome.storage.sync.set({finishDelay: 1.5}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU finishDelay Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created finishDelay setting.');
					}
				});
				$('#finishDelay').val(1.5);
			} else {
				$('#finishDelay').val(items.finishDelay);
			}

			// monitor group
			if (isVarEmpty(items.monitorGroup) === true) {
				chrome.storage.sync.set({monitorGroup: false}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU monitorGroup Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created monitorGroup setting.');
					}
				});
				$('#monitorGroup').val('disable');
			} else {
				$('#monitorGroup').val((items.monitorGroup === true) ? 'enable' : 'disable');
			}

			// assignment group
			if (isVarEmpty(items.assignGroup) === true) {
				chrome.storage.sync.set({assignGroup: '7d8ea2206fcaf60449bfd4a21c3ee406'}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU assignGroup Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created assignGroup setting.');
					}
				});
				$('#assignGroup').val('7d8ea2206fcaf60449bfd4a21c3ee406');
			} else {
				$('#assignGroup').val(items.assignGroup);
			}

			// monitor interval
			if (isVarEmpty(items.monitorInterval) === true) {
				chrome.storage.sync.set({monitorInterval: 3}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU monitorInterval Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created monitorInterval setting.');
					}
				});
				$('#monitorInterval').val(3);
			} else {
				$('#monitorInterval').val(items.monitorInterval);
			}

			// send on enter
			if (isVarEmpty(items.sendEnter) === true) {
				chrome.storage.sync.set({sendEnter: true}, function() {
					if (chrome.runtime.lastError) {
						console.error('SNAFU sendEnter Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Create sendEnter setting.');
					}
				});
				$('#sendEnter').val('enable');
			} else {
				$('#sendEnter').val((items.sendEnter === true) ? 'enable' : 'disable');
			}

			// set user info
			$('#fullName').val((!isVarEmpty(items.fullName)) ? items.fullName : '');
			$('#userName').val((!isVarEmpty(items.userName)) ? items.userName : '');
			$('#userId').val((!isVarEmpty(items.userId)) ? items.userId : '');
			$('#userEmail').val((!isVarEmpty(items.userEmail)) ? items.userEmail : '');
			$('#groupName').val((!isVarEmpty(items.groupName)) ? items.groupName : '');
			$('#groupId').val((!isVarEmpty(items.groupId)) ? items.groupId : '');

			console.info('SNAFU: Loaded settings.');
		}
	});
}

/**
 * Loads canned messages to an object.
 * @return	{Object|Boolean}
 */
function getCannedMessages() {
	var msgs = $('#cannedMsgs').val().split('\n');
	var objMsgs = {};

	if (msgs.length > 0) {
		for (var i = 0; i < msgs.length; i++) {
			var strTemp = msgs[i];
			if (strTemp.trim() !== '' && strTemp.indexOf('|') !== -1) {
				var left = strTemp.substring(0, strTemp.indexOf('|'));
				var right = strTemp.substring(strTemp.indexOf('|') + 1);
				objMsgs[left] = right;
			}
		}
		return objMsgs;
	} else {
		return false;
	}
}

/**
 * Checks if a variable is empty (null, undefined, NaN, etc.).
 * @param   {String}    value
 * @return  {Boolean}
 */
function isVarEmpty(value) {
    return (value === null || value === undefined || value === NaN || value.toString().trim() === '') ? true : false
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

/**
 * Set success message.
 * @param	{String}	msg
 */
function successMessage(msg) {
	$('#alertSuccessMsg').text(msg);
	$('#alertSuccess').fadeIn();
	setTimeout(function() { $('#alertSuccess').fadeOut(); }, 2500);
}

/**
 * Set error message.
 * @param	{String}	msg
 */
function errorMessage(msg) {
	$('#alertFailureMsg').text(msg);
	$('#alertFailure').fadeIn();
	setTimeout(function() { $('#alertFailure').fadeOut(); }, 2500);
}