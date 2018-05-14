/**
 *  SNAFU: SNow Automated Form Utilizer
 *  Copyright (C) 2018  Adam Koch <akoch@ghs.org>
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

const docPatterns = ['https://ghsprod.service-now.com/sc_task.do?*', 'https://ghsprod.service-now.com/incident.do?*', 'https://ghsprod.service-now.com/u_absolute_install.do?*'];
const docPatternsChoose = {
	global: 'https://ghsprod.service-now.com/*',
	task: 'https://ghsprod.service-now.com/sc_task.do?*',
	incident: 'https://ghsprod.service-now.com/incident.do?*',
	absolute: 'https://ghsprod.service-now.com/u_absolute_install.do?*'
}

/**
 * Uber Parent
 */
chrome.contextMenus.create({
	title: 'SNAFU',
	contexts: ['page'],
	id: 'snafuParent',
	documentUrlPatterns: [docPatternsChoose.global]
});

/**
 * Auto Acknowledge
 */
chrome.contextMenus.create({
	title: 'Auto Acknowledge',
	contexts: ['page'],
	id: 'autoAcknowledge',
	parentId: 'snafuParent',
	documentUrlPatterns: docPatterns,
	onclick: actionHandler
});

/**
 * Auto "En Route"
 */
chrome.contextMenus.create({
	title: 'Auto En Route',
	contexts: ['page'],
	id: 'autoEnRoute',
	parentId: 'snafuParent',
	documentUrlPatterns: docPatterns,
	onclick: actionHandler
});

/**
 * Auto Pending
 */
chrome.contextMenus.create({
	title: 'Auto Pending',
	contexts: ['page'],
	id: 'autoPending',
	parentId: 'snafuParent',
	documentUrlPatterns: [docPatternsChoose.task],
	onclick: actionHandler
});

/**
 * Auto Closure
 */
chrome.contextMenus.create({
	title: 'Auto Close',
	contexts: ['page'],
	id: 'autoClose',
	parentId: 'snafuParent',
	documentUrlPatterns: docPatterns,
	onclick: actionHandler
});

chrome.contextMenus.create({type: 'separator', parentId: 'snafuParent'});

/**
 * In Progress Note
 */
var ticketTypes = ['Task', 'Incident']
for (var i = 0; i < ticketTypes.length; i++) {
	chrome.contextMenus.create({
		title: 'In Progress',
		contexts: ['page'],
		id: ticketTypes[i].toLowerCase() + '-0',
		parentId: 'snafuParent',
		documentUrlPatterns: [docPatternsChoose[ticketTypes[i].toLowerCase()]],
		onclick: ticketHandler	
	});

	chrome.contextMenus.create({
		title: 'On Hold',
		contexts: ['page'],
		id: ticketTypes[i].toLowerCase() + '-1',
		parentId: 'snafuParent',
		documentUrlPatterns: [docPatternsChoose[ticketTypes[i].toLowerCase()]],
		onclick: ticketHandler
	});

	chrome.contextMenus.create({
		title: 'Resolved',
		contexts: ['page'],
		id: ticketTypes[i].toLowerCase() + '-2',
		parentId: 'snafuParent',
		documentUrlPatterns: [docPatternsChoose[ticketTypes[i].toLowerCase()]],
		onclick: ticketHandler
	});
}

chrome.contextMenus.create({type: 'separator', parentId: 'snafuParent'});

/**
 * Close Hot Swap Task
 */
chrome.contextMenus.create({
	title: 'Close Hot Swap Task',
	contexts: ['page'],
	id: 'closeHotSwapParent',
	parentId: 'snafuParent',
	documentUrlPatterns: [docPatternsChoose.task]
});

chrome.contextMenus.create({
	title: 'New Device (Out of Box)',
	contexts: ['page'],
	id: 'closeHotSwapNew',
	parentId: 'closeHotSwapParent',
	documentUrlPatterns: [docPatternsChoose.task],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Repurposed In Stock',
	contexts: ['page'],
	id: 'closeHotSwapRepurposed',
	parentId: 'closeHotSwapParent',
	documentUrlPatterns: [docPatternsChoose.task],
	onclick: actionHandler
});

/**
 * Close Quarantine Task
 */
chrome.contextMenus.create({
	title: 'Close Quarantine Task',
	contexts: ['page'],
	id: 'closeQuarantineParent',
	parentId: 'snafuParent',
	documentUrlPatterns: [docPatternsChoose.task]
});

chrome.contextMenus.create({
	title: 'Decommission Device',
	contexts: ['page'],
	id: 'closeQuarantineDecommission',
	parentId: 'closeQuarantineParent',
	documentUrlPatterns: [docPatternsChoose.task],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Repair Device',
	contexts: ['page'],
	id: 'closeQuarantineRepairParent',
	parentId: 'closeQuarantineParent',
	documentUrlPatterns: [docPatternsChoose.task]
});

chrome.contextMenus.create({
	title: 'On-Site',
	contexts: ['page'],
	id: 'closeQuarantineRepairYes',
	parentId: 'closeQuarantineRepairParent',
	documentUrlPatterns: [docPatternsChoose.task],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'At MDC',
	contexts: ['page'],
	id: 'closeQuarantineRepairNo',
	parentId: 'closeQuarantineRepairParent',
	documentUrlPatterns: [docPatternsChoose.task],
	onclick: actionHandler
});


chrome.contextMenus.create({
	title: 'Restock Device',
	contexts: ['page'],
	id: 'closeQuarantineRestock',
	parentId: 'closeQuarantineParent',
	documentUrlPatterns: [docPatternsChoose.task],
	onclick: actionHandler
});

/**
 * Close Repair Tasks
 */
chrome.contextMenus.create({
	title: 'Close Repair Task',
	contexts: ['page'],
	id: 'closeRepairParent',
	parentId: 'snafuParent',
	documentUrlPatterns: [docPatternsChoose.task]
});

chrome.contextMenus.create({
	title: 'Repairs Completed (Restock)',
	contexts: ['page'],
	id: 'closeRepairOnSite',
	parentId: 'closeRepairParent',
	documentUrlPatterns: [docPatternsChoose.task],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Not Cost Efficient (Decommission)',
	contexts: ['page'],
	id: 'closeRepairDecommission',
	parentId: 'closeRepairParent',
	documentUrlPatterns: [docPatternsChoose.task],
	onclick: actionHandler
});

chrome.contextMenus.create({type: 'separator', parentId: 'snafuParent'});

/**
 * Ticket Assignments
 */
chrome.contextMenus.create({
	title: 'Assignments',
	contexts: ['page'],
	id: 'assignParent',
	parentId: 'snafuParent'
});

chrome.contextMenus.create({
	title: 'Assign Incident To Me',
	contexts: ['page'],
	id: 'assignIncToMe',
	parentId: 'assignParent',
	documentUrlPatterns: ['https://make/it/hidden'],
	onclick: function() {
		chrome.storage.sync.get(['userId', 'fullName', 'groupId', 'groupName'], function(items) {
			if (chrome.runtime.lastError) {
				chrome.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
			} else {
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {
						type: 'assignToMe',
						userInfo: {
							userId: items.userId,
							fullName: items.fullName,
							groupId: items.groupId,
							groupName: items.groupName
						}
					}, handleResponse);
				});
			}
		});
	}
});

chrome.contextMenus.create({
	title: 'Assign Task To Me',
	contexts: ['page'],
	id: 'assignTaskToMe',
	parentId: 'assignParent',
	documentUrlPatterns: ['https://make/it/hidden'],
	onclick: function() {
		chrome.storage.sync.get(['userId', 'fullName', 'groupId', 'groupName'], function(items) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {
					type: 'assignToMe',
					userInfo: {
						userId: items.userId,
						fullName: items.fullName,
						groupId: items.groupId,
						groupName: items.groupName
					}
				}, handleResponse);
			});
		});
	}
});

chrome.contextMenus.create({
	id: 'assignSeparator',
	type: 'separator',
	parentId: 'assignParent',
	documentUrlPatterns: ['https://make/it/hidden']
});

chrome.contextMenus.create({
	title: 'Query User Data',
	contexts: ['page'],
	id: 'queryOrReset',
	parentId: 'assignParent'
});

/**
 * Options Parent
 */
chrome.contextMenus.create({
	title: 'Options',
	contexts: ['page'],
	id: 'optionsParent',
	parentId: 'snafuParent'
});

chrome.contextMenus.create({
	title: 'Ticket Completion',
	contexts: ['page'],
	id: 'autoFinishParent',
	parentId: 'optionsParent'
});

const ticketCompletion = {'save': 'Save', 'update': 'Update', 'auto': 'Automatic', 'none': 'None'};
for (var opt in ticketCompletion) {
	chrome.contextMenus.create({
		title: ticketCompletion[opt],
		type: 'radio',
		contexts: ['page'],
		id: 'autoFinish-' + opt,
		parentId: 'autoFinishParent',
		checked: false,
		onclick: optionsHandler
	});
}

chrome.contextMenus.create({
	title: 'Close Popup',
	contexts: ['page'],
	id: 'closePopupParent',
	parentId: 'optionsParent'
});

chrome.contextMenus.create({
	title: 'Persistent Notes',
	contexts: ['page'],
	id: 'keepNotesParent',
	parentId: 'optionsParent'
});

chrome.contextMenus.create({
	title: 'Keep on Submit',
	contexts: ['page'],
	id: 'clearNotesParent',
	parentId: 'optionsParent'
});

chrome.contextMenus.create({
	title: 'Send On Enter',
	contexts: ['page'],
	id: 'sendEnterParent',
	parentId: 'optionsParent'
});

chrome.contextMenus.create({
	title: 'Close Alerts',
	contexts: ['page'],
	id: 'closeAlertsParent',
	parentId: 'optionsParent'
});

chrome.contextMenus.create({
	title: 'Computer Reminders',
	contexts: ['page'],
	id: 'remindParent',
	parentId: 'optionsParent'
});

const reminders = {'none': 'None', 'popup': 'Popup Reminder', 'open': 'Open Computer Database'}
for (var opt in reminders) {
	chrome.contextMenus.create({
		title: reminders[opt],
		type: 'radio',
		contexts: ['page'],
		id: 'remind-' + opt,
		parentId: 'remindParent',
		checked: false,
		onclick: optionsHandler
	});
}

chrome.contextMenus.create({
	title: 'Build Log',
	contexts: ['page'],
	id: 'buildLogParent',
	parentId: 'optionsParent'
});

chrome.contextMenus.create({
	title: 'Decommission Log',
	contexts: ['page'],
	id: 'decomLogParent',
	parentId: 'optionsParent'
});

chrome.contextMenus.create({
	title: 'Repair Log',
	contexts: ['page'],
	id: 'repairLogParent',
	parentId: 'optionsParent'
});

chrome.contextMenus.create({
	title: 'Debug Mode',
	contexts: ['page'],
	id: 'debugParent',
	parentId: 'optionsParent'
});

const toggleOptions = ['closePopup', 'keepNotes', 'clearNotes', 'sendEnter', 'closeAlerts', 'buildLog', 'decomLog', 'repairLog', 'debug'];
const objToggle = {'enable': 'Enabled', 'disable': 'Disabled'};

for (var i = 0; i < toggleOptions.length; i++) {
	for (var opt in objToggle) {
		chrome.contextMenus.create({
			title: objToggle[opt],
			type: 'radio',
			contexts: ['page'],
			id: toggleOptions[i] + '-' + opt,
			parentId: toggleOptions[i] + 'Parent',
			checked: false,
			onclick: optionsHandler
		});
	}
}

chrome.contextMenus.create({type: 'separator', parentId: 'buildLogParent'});
chrome.contextMenus.create({type: 'separator', parentId: 'decomLogParent'});
chrome.contextMenus.create({type: 'separator', parentId: 'repairLogParent'});

chrome.contextMenus.create({
	title: "Open Build Log",
	contexts: ['page'],
	id: 'openBuildLog',
	parentId: 'buildLogParent',
	onclick: function() { openLink(chrome.runtime.getURL('html/builds.html')); }
});

chrome.contextMenus.create({
	title: 'Open Decommission Log',
	contexts: ['page'],
	id: 'openDecomLog',
	parentId: 'decomLogParent',
	onclick: function() { openLink(chrome.runtime.getURL('html/decoms.html')); }
});

chrome.contextMenus.create({
	title: 'Open Repair Log',
	contexts: ['page'],
	id: 'openRepairLog',
	parentId: 'repairLogParent',
	onclick: function() { openLink(chrome.runtime.getURL('html/repairs.html')); }
});

chrome.contextMenus.create({type: 'separator', parentId: 'optionsParent'});

chrome.contextMenus.create({
	title: 'Options Page',
	contexts: ['page'],
	id: 'optionsPage',
	parentId: 'optionsParent',
	onclick: function() { openLink(chrome.runtime.getURL('html/options.html')); }
});

/**
 * Labels
 */
chrome.contextMenus.create({
	title: 'Print Label',
	contexts: ['page'],
	id: 'printLabelParent',
	parentId: 'snafuParent',
	documentUrlPatterns: [docPatternsChoose.global]
});

const menuLblTypes = ['build', 'buildack', 'decommission', 'reclaim', 'repair', 'restock']
for (var i = 0; i < menuLblTypes.length; i++) {
	chrome.contextMenus.create({
		title: sprintf('%s Label', [(menuLblTypes[i] === 'buildack') ? 'Build Acknowledgement' : ucwords(menuLblTypes[i])]),
		contexts: ['page'],
		id: sprintf('printLabel%s', [(menuLblTypes[i] === 'buildack') ? 'BuildAck' : ucwords(menuLblTypes[i])]),
		parentId: 'printLabelParent',
		documentUrlPatterns: [docPatternsChoose.task],
		onclick: actionHandler
	});
}

chrome.contextMenus.create({type: 'separator', parentId: 'printLabelParent', documentUrlPatterns: [docPatternsChoose.task]});

chrome.contextMenus.create({
	title: 'Broken Equipment Label',
	contexts: ['page'],
	id: 'printLabelBroken',
	parentId: 'printLabelParent',
	documentUrlPatterns: docPatterns,
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Purchase Order Label',
	contexts: ['page'],
	id: 'printLabelPurchase',
	parentId: 'printLabelParent',
	documentUrlPatterns: [docPatternsChoose.global],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Prebuilt Device Label',
	contexts: ['page'],
	id: 'printLabelPrebuilt',
	parentId: 'printLabelParent',
	documentUrlPatterns: [docPatternsChoose.global],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Staging Transfer Label',
	contexts: ['page'],
	id: 'printLabelStaging',
	parentId: 'printLabelParent',
	documentUrlPatterns: [docPatternsChoose.global],
});

chrome.contextMenus.create({
	title: 'Single Label',
	contexts: ['page'],
	id: 'printLabelStagingSingle',
	parentId: 'printLabelStaging',
	documentUrlPatterns: [docPatternsChoose.global],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Entire Ticket',
	contexts: ['page'],
	id: 'printLabelStagingEntire',
	parentId: 'printLabelStaging',
	documentUrlPatterns: [docPatternsChoose.global],
	onclick: actionHandler
});

chrome.contextMenus.create({type: 'separator', parentId: 'snafuParent'});

/**
 * Miscellaneous
 */
chrome.contextMenus.create({
	title: 'Miscellaneous',
	contexts: ['page'],
	id: 'miscParent',
	parentId: 'snafuParent'
});

chrome.contextMenus.create({
	title: 'Computer Database',
	contexts: ['page'],
	id: 'computerDb',
	parentId: 'miscParent',
	onclick: function() { openLink('https://ghsprod.service-now.com/cmdb_ci_computer_list.do?sysparm_query=sys_class_name=cmdb_ci_computer') }
});

chrome.contextMenus.create({
	title: 'Create New Incident',
	contexts: ['page'],
	id: 'newIncident',
	parentId: 'miscParent',
	onclick: function() { openLink('https://ghsprod.service-now.com/incident.do?sysparm_stack=incident_list.do&sys_id=-1') }
});

chrome.contextMenus.create({
	title: 'Knowledge Database',
	contexts: ['page'],
	id: 'knowledgeBase',
	parentId: 'miscParent',
	onclick: function() { openLink('https://ghsprod.service-now.com/kb_home.do') }
});

chrome.contextMenus.create({
	title: 'Service Catalog',
	contexts: ['page'],
	id: 'serviceCatalog',
	parentId: 'miscParent',
	onclick: function() { openLink('https://ghsprod.service-now.com/catalog_home.do?sysparm_view=catalog_default') }
});

/**
 * Help Page
 */
chrome.contextMenus.create({
	title: 'Help',
	contexts: ['page'],
	id: 'helpParent',
	parentId: 'snafuParent'
});

chrome.contextMenus.create({
	title: 'Changelog',
	contexts: ['page'],
	id: 'changelogPage',
	parentId: 'helpParent',
	onclick: function() { openLink(chrome.runtime.getURL('html/changelog.html')); }
});

chrome.contextMenus.create({
	title: 'FAQ',
	contexts: ['page'],
	id: 'faqPage',
	parentId: 'helpParent',
	onclick: function() { openLink(chrome.runtime.getURL('html/faq.html')); }
});

chrome.contextMenus.create({
	title: 'Help Page',
	contexts: ['page'],
	id: 'helpPage',
	parentId: 'helpParent',
	onclick: function() { openLink(chrome.runtime.getURL('html/help.html')); }
});

// monitor user data settings to update the context menu
chrome.storage.onChanged.addListener(function(changes, area) {
	if (area === 'sync') {
		if ('userId' in changes) {
			chrome.contextMenus.update('assignIncToMe', {documentUrlPatterns: (isVarEmpty(changes.userId.newValue) === true) ? ['https://make/it/hidden/'] : [docPatternsChoose.incident]});
			chrome.contextMenus.update('assignTaskToMe', {documentUrlPatterns: (isVarEmpty(changes.userId.newValue) === true) ? ['https://make/it/hidden/'] : [docPatternsChoose.task]});
			chrome.contextMenus.update('assignSeparator', {documentUrlPatterns: (isVarEmpty(changes.userId.newValue) === true) ? ['https://make/it/hidden/'] : [docPatternsChoose.incident, docPatternsChoose.task]});
			chrome.contextMenus.update('queryOrReset', {
				title: (isVarEmpty(changes.userId.newValue) === true) ? 'Query User Data' : 'Reset User Data',
				onclick: (isVarEmpty(changes.userId.newValue) === true) ? queryUserData : resetUserData
			});
		} else if ('autoFinish' in changes) {
			// set the autofinish radio
			['save', 'update', 'auto', 'none'].forEach(function(opt) {
				chrome.contextMenus.update('autoFinish-' + opt, {checked: (changes.autoFinish.newValue === opt) ? true : false});
			});
		} else if ('remind' in changes) {
			['none', 'popup', 'open'].forEach(function(opt) {
				chrome.contextMenus.update('remind-' + opt, {checked: (changes.remind.newValue === opt) ? true : false});
			});
		} else {
			for (option in changes) {
				updateRadio(option, changes[option].newValue);
			}
		}
	}
});

// update the option menus
updateOptionMenus();

/**
 * Onclick handler for actions
 * @param	{Object}	info
 * @param	{Object}	tab
 * @return	{Void}
 */
function actionHandler(info, tab) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {type: info.menuItemId}, handleResponse);
	});
}

/**
 * OnClick Handler For Creating Chrome Tabs
 * @param	{String}	url
 * @return	{Void}
 */
function openLink(url) {
	chrome.tabs.create({url: url});
}

/**
 * Onclick handler for option menus.
 * @param	{Object}	info
 * @param	{Object}	tabs
 * @return	{Void}
 */
function optionsHandler(info, tab) {
	var setting = info.menuItemId.substring(0, info.menuItemId.indexOf('-'));
	var value = info.menuItemId.substring(info.menuItemId.indexOf('-') + 1);
	var newSetting = {}
	newSetting[setting] = (setting === 'autoFinish' || setting === 'remind') ? value : (value === 'enable') ? true : false;
	chrome.storage.sync.set(newSetting, function() {
		if (chrome.runtime.lastError) {
			console.error('SNAFU %s Set Error: %s', setting, chrome.runtime.lastError.message);
		} else {
			console.info('SNAFU: Updated %s.', setting);
		}	
	});
	updateOptionMenus();
}

/**
 * Handle Ticket Menus
 * @param	{Object}	info
 * @param	{Object}	tabs
 * @return	{Void}
 */
function ticketHandler(info, tab) {
	var comment = prompt('Enter the comment to send. This is REQUIRED.');
	if (!isVarEmpty(comment)) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'sendUpdate',
				tState: info.menuItemId.substring(info.menuItemId.indexOf('-') + 1),
				custNotes: comment,
			}, handleResponse);
		});
	}
}

/**
 * Queries user data.
 * @return	{Void}
 */
function queryUserData() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {type: 'userQuery'}, handleResponse);
	});
}

/**
 * Resets user data.
 * @return	{Void}
 */
function resetUserData() {
	chrome.storage.sync.remove(['userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId'], function() {
		if (chrome.runtime.lastError) {
			console.error('SNAFU Sync Remove Error: %s', chrome.runtime.lastError.message);
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {
					type: 'sendErrorMsg',
					statusMsg: 'Failed to reset your user data.'
				}, handleResponse);
			});
		} else {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {
					type: 'sendSuccessMsg',
					statusMsg: 'Successfully reset your user data.'
				}, handleResponse);
			});
		}
	});
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
					//console.error('SNAFU Error: Unable to process response to message.');
				}
			}
		}
	});
}

/**
 * Update option menus.
 * @return	{Void}
 */
function updateOptionMenus() {
	chrome.storage.sync.get(['debug', 'autoFinish', 'closePopup', 'sendEnter', 'keepNotes', 'closeAlerts', 'remind', 'buildLog', 'decomLog', 'repairLog', 'userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId'], function(items) {
		if (chrome.runtime.lastError) {
			console.error('SNAFU User Sync Error: %s', chrome.runtime.lastError.message);
		} else {
			chrome.contextMenus.update('assignIncToMe', {documentUrlPatterns: (isVarEmpty(items.userId) === true) ? ['https://make/it/hidden/'] : [docPatternsChoose.incident]});
			chrome.contextMenus.update('assignTaskToMe', {documentUrlPatterns: (isVarEmpty(items.userId) === true) ? ['https://make/it/hidden/'] : [docPatternsChoose.task]});
			chrome.contextMenus.update('assignSeparator', {documentUrlPatterns: (isVarEmpty(items.userId) === true) ? ['https://make/it/hidden/'] : [docPatternsChoose.incident, docPatternsChoose.task]});
			chrome.contextMenus.update('queryOrReset', {
				title: (isVarEmpty(items.userId) === true) ? 'Query User Data' : 'Reset User Data',
				onclick: (isVarEmpty(items.userId) === true) ? queryUserData : resetUserData
			});

			// set the autofinish radio
			['save', 'update', 'auto', 'none'].forEach(function(opt) {
				chrome.contextMenus.update('autoFinish-' + opt, {checked: (items.autoFinish === opt) ? true : false});
			});

			// set the reminder radio
			['none', 'popup', 'open'].forEach(function(opt) {
				chrome.contextMenus.update('remind-' + opt, {checked: (items.remind === opt) ? true : false});
			});

			// update radios
			var radios = ['closePopup', 'debug', 'sendEnter', 'keepNotes', 'clearNotes', 'closeAlerts', 'buildLog', 'decomLog', 'repairLog'];
			for (var i = 0; i < radios.length; i++) {
				updateRadio(radios[i], items[radios[i]]);
			}

		}
	});
}

/**
 * Update on/of radios.
 * @param	{String}	menuId
 * @param	{Bool}		value
 * @return	{Void}
 */
function updateRadio(menuId, value) {
	chrome.contextMenus.update(sprintf('%s-enable', [menuId]), {checked: (value === true) ? true : false});
	chrome.contextMenus.update(sprintf('%s-disable', [menuId]), {checked: (value === false) ? true : false});
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