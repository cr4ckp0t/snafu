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

var debug;

$(document).ready(function() {
	$('[id$=Success').hide();
	$('[id$=Failure').hide();

	loadSettings();

	$('#saveSettings').click(function() {
		chrome.storage.sync.set({
			debug: ($('#debugMode').val() === 'enable') ? true : false,
			canned: getCannedMessages(),
			autoFinish: $('#ticketCompletion').val()
		}, function() {
			if (chrome.runtime.lastError) {
				console.warn('SNAFU Sync Set Error: %s', chrome.runtime.lastError.message);
				errorMessage('Failed to save settings.');
			} else {
				loadSettings();
				successMessage('Settings saved successfully.');
			}
		});
	});

	$('#reloadData').click(function() { loadSettings(); });

	$('#closeWindow').click(function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.remove(tabs[0].id);
		});
	});

	// reset user data
	$('#resetUser').click(function() {
		chrome.storage.sync.remove(['userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId'], function() {
			if (chrome.runtime.lastError) {
				console.warn('SNAFU Sync Remove Error: %s', chrome.runtime.lastError.message);
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
				console.warn('SNAFU Sync Clear Error: %s', chrome.runtime.lastError.message);
				errorMessage('Failed to clear settings.');
			} else {
				if (debug === true) {
					console.info('SNAFU: Cleared all settings.');
				}
				successMessage('Successfully cleared all settings.');
			}
		});
	});
});

function loadSettings() {
	chrome.storage.sync.get(['debug', 'canned', 'autoFinish', 'userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId'], function(items) {
		if (chrome.runtime.lastError) {
			console.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {

			// debug settings
			if (isVarEmpty(items.debug) === true) {
				chrome.storage.sync.set({debug: false}, function() {
					if (chrome.runtime.lastError) {
						console.warn('SNAFU debug Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created debug setting.');
					}
				});
				$('#debugMode').val('disable');
			} else {
				$('#debugMode').val((items.debug === true) ? 'enable' : 'disable');
				debug = items.debug;
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
						console.warn('SNAFU canned Set Error: %s', chrome.runtime.lastError.message);
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
						console.warn('SNAFU autoFinish Set Error: %s', chrome.runtime.lastError.message);
					} else {
						console.info('SNAFU: Created autoFinish setting.');
					}
				});
			} else {
				$('#ticketCompletion').val(items.autoFinish);
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

function getCannedMessages() {
	var msgs = $('#cannedMsgs').val().split('\n');
	var objMsgs = {};

	if (msgs.length > 0) {
		for (var i = 0; i < msgs.length; i++) {
			var strTemp = msgs[i];
			if (strTemp.trim() !== '' && strTemp.indexOf('|') !== -1) {
				var left = strTemp.substring(0, strTemp.indexOf('|') - 1);
				var right = strTemp.substring(strTemp.indexOf('|') + 1);
				objMsgs[left] = right;
				console.info('SNAFU Left: %s', left);
				console.info('SNAFU Right: %s', right);
			}
		}
		return objMsgs;
	} else {
		return false;
	}
}

function isVarEmpty(value) {
    return (value === null || value === undefined || value === NaN || value.toString().trim() === '') ? true : false
}

function successMessage(msg) {
	$('#alertSuccessMsg').text('Settings saved successfully.');
	$('#alertSuccess').fadeIn();
	setTimeout(function() { $('#alertSuccess').fadeOut(); }, 2500);
}

function errorMessage(msg) {
	$('#alertFailureMsg').text('Failed to save settings.');
	$('#alertFailure').fadeIn();
	setTimeout(function() { $('#alertFailure').fadeOut(); }, 2500);
}