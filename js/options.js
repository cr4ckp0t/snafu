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
	$('#versionAbout').html(chrome.app.getDetails().version);
	$('#openFaq').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/faq.html')}); });
	$('#openHelp').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/help.html')}); });
	$('#openBuildLog').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/builds.html')}); });
	$('#openDecomLog').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/decoms.html')}); });
	$('#openRepairLog').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/repairs.html')}); });
	$('#openChangelog').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/changelog.html')}); });
	$('#closeWindow').click(function() { chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { chrome.tabs.remove(tabs[0].id); }); });

	$('#reloadData').click(function() { 
		loadSettings();
		successMessage('Reloaded settings successsfully.');
	});

	$('[id$=Toggle]').click(function(event) {
		var isChecked = $('#' + event.target.id).is(':checked');
		var inputId = event.target.id.replace('Toggle', '') + 'Time';
		$('#' + inputId).prop('disabled', (isChecked === true) ? false : true);
	});

	// reset user data
	$('#resetUser').click(function() {
		chrome.storage.sync.remove(['userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId'], function() {
			if (chrome.runtime.lastError) {
				console.error('SNAFU Sync Remove Error: %s', chrome.runtime.lastError.message);
				errorMessage('Failed to remove user data.');
			} else {
				successMessage('Successfully removed user data.');
				loadSettings();
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
	console.info(($('#labelBuildack').val() === 'enable') ? true : false);
	chrome.storage.sync.set({
		debug: ($('#debugMode').val() === 'enable') ? true : false,
		closePopup: ($('#closePopup').val() === 'enable') ? true: false,
		sendEnter: ($('#sendEnter').val() === 'enable') ? true : false,
		keepNotes: ($('#keepNotes').val() === 'enable') ? true : false,
		clearNotes: ($('#clearNotes').val() === 'enable') ? true : false,
		canned: getCannedMessages(),
		autoFinish: $('#ticketCompletion').val(),
		finishDelay: $('#finishDelay').val(),
		closeAlerts: ($('#closeAlerts').val() === 'enable') ? true : false,
		buildLog: ($('#buildLog').val() === 'enable') ? true : false,
		repairLog: ($('#repairLog').val() === 'enable') ? true : false,
		decomLog: ($('#decomLog').val() === 'enable') ? true : false,
		remind: $('#remind').val(),
		labels: {
			build: ($('#labelBuild').val() === 'enable') ? true : false,
			buildack: ($('#labelBuildack').val() === 'enable') ? true : false,
			decommission: ($('#labelDecommission').val() === 'enable') ? true : false,
			equipment: ($('#labelEquipment').val() === 'enable') ? true : false,
			reclaim: ($('#labelReclaim').val() === 'enable') ? true : false,
			reimage: ($('#labelReimage').val() === 'enable') ? true : false,
			reimageack: ($('#labelReimageack').val() === 'enable') ? true : false,
			repair: ($('#labelRepair').val() === 'enable') ? true : false,
			restock: ($('#labelRestock').val() === 'enable') ? true : false
		}
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
	chrome.storage.sync.get([
		'debug',
		'closePopup',
		'canned',
		'autoFinish',
		'finishDelay',
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
		'userId',
		'userName',
		'userEmail',
		'fullName',
		'groupName',
		'groupId',
	], function(items) {
		if (chrome.runtime.lastError) {
			console.error('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {
			var settingsToCreate = {}
			var labelTypes = ['build', 'buildack', 'decommission', 'equipment', 'reclaim', 'reimage', 'reimageack', 'repair', 'restock'];

			// debug settings
			if (isVarEmpty(items.debug) === true) {
				settingsToCreate['debug'] = false;
				$('#debugMode').val('disable');
			} else {
				$('#debugMode').val((items.debug === true) ? 'enable' : 'disable');
			}

			// close popup on submit
			if (isVarEmpty(items.closePopup) === true) {
				settingsToCreate['closePopup'] = false;
				$('#closePopup').val('disable');
			} else {
				$('#closePopup').val((items.closePopup === true) ? 'enable' : 'disable');
			}
			
			// canned messages
			if (isVarEmpty(items.canned) === true) {
				settingsToCreate['canned'] = {
					'callingUser': 'Calling {INC_CUST_FNAME} at {INC_CUR_PHONE}.',
					'leftVoicemail': 'Left voicemail for {INC_CUST_FNAME} at {INC_CUR_PHONE} to discuss the ticket.'
				}
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
				settingsToCreate['autoFinish'] = 'none';
				$('#ticketCompletion').val('none');
			} else {
				$('#ticketCompletion').val(items.autoFinish);
			}

			// finish delay
			if (isVarEmpty(items.finishDelay) === true) {
				settingsToCreate['finishDelay'] = 1.5;
				$('#finishDelay').val(1.5);
			} else {
				$('#finishDelay').val(items.finishDelay);
			}

			// send on enter
			if (isVarEmpty(items.sendEnter) === true) {
				settingsToCreate['sendEnter'] = true;
				$('#sendEnter').val('enable');
			} else {
				$('#sendEnter').val((items.sendEnter === true) ? 'enable' : 'disable');
			}

			// keep notes
			if (isVarEmpty(items.keepNotes) === true) {
				settingsToCreate['keepNotes'] = false;
				$('#keepNotes').val('disable');
			} else {
				$('#keepNotes').val((items.keepNotes === true) ? 'enable' : 'disable');
			}

			// persist notes after submission
			if (isVarEmpty(items.clearNotes) === true) {
				settingsToCreate['clearNotes'] = true;
				$('#clearNotes').val('disable');
			} else {
				$('#clearNotes').val((items.clearNotes === true) ? 'enable' : 'disable');
			}

			// close alerts
			if (isVarEmpty(items.closeAlerts) === true) {
				settingsToCreate['closeAlerts'] = true;
				$('#closeAlerts').val('enable');
			} else {
				$('#closeAlerts').val((items.closeAlerts === true) ? 'enable' : 'disable');
			}
			
			// computer location reminder
			if (isVarEmpty(items.remind) === true) {
				settingsToCreate['remind'] = 'open';
				$('#remind').val('open');
			} else {
				$('#remind').val(items.remind);
			}

			// label printing
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
				for (var i = 0; i < labelTypes.length; i++) {
					$('#label' + ucwords(labelTypes[i])).val('enable');
				}
			} else {
				for (var i = 0; i < labelTypes.length; i++) {
					$('#label' + ucwords(labelTypes[i])).val((items.labels[labelTypes[i]] === true) ? 'enable' : 'disable');
				}
			}

			// build log
			if (isVarEmpty(items.buildLog) === true) {
				settingsToCreate['buildLog'] = false;
				$('#buildLog').val('disable');
			} else {
				$('#buildLog').val((items.buildLog === true) ? 'enable' : 'disable');
			}

			// decom log
			if (isVarEmpty(items.decomLog) === true) {
				settingsToCreate['decomLog'] = false;
				$('#decomLog').val('disable');
			} else {
				$('#decomLog').val((items.decomLog === true) ? 'enable' : 'disable');
			}

			// repair log
			if (isVarEmpty(items.repairLog) === true) {
				settingsToCreate['repairLog'] = false;
				$('#repairLog').val('disable');
			} else {
				$('#repairLog').val((items.repairLog === true) ? 'enable' : 'disable');
			}

			// completed builds
			if (isVarEmpty(items.builds) === true) settingsToCreate['builds'] = {};

			// completed decoms
			if (isVarEmpty(items.decoms) === true) settingsToCreate['decoms'] = {};

			// completed repairs
			if (isVarEmpty(items.repairs) === true) settingsToCreate['repairs'] = {};
			
			// send the settings to sync storage
			if (settingsToCreate === {}) {
				console.info(settingsToCreate);
				chrome.storage.sync.set(settingsToCreate, function() {
					if (chrome.runtime.lastError) {
						console.warn('SNAFU Sync Set Error: %s', chrome.runtime.lastError);
					} else {
						console.info('SNAFU: Created settings successfully.');
					}
				});
			}

			// set user info
			$('#fullName').val((!isVarEmpty(items.fullName)) ? items.fullName : '');
			$('#userName').val((!isVarEmpty(items.userName)) ? items.userName : '');
			$('#userId').val((!isVarEmpty(items.userId)) ? items.userId : '');
			$('#userEmail').val((!isVarEmpty(items.userEmail)) ? items.userEmail : '');
			$('#groupName').val((!isVarEmpty(items.groupName)) ? items.groupName : '');
			$('#groupId').val((!isVarEmpty(items.groupId)) ? items.groupId : '');

			if (items.debug === true) console.info('SNAFU: Loaded settings.');
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
 * Capitalizes the first character of each word.
 * @param	{String}	str
 * @return	{String}
 */
function ucwords(str) {
	return str.toLowerCase().replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function(e) {
		return e.toUpperCase();
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