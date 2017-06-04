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

/**
 * Uber Parent
 */
chrome.contextMenus.create({
	title: 'SNAFU',
	contexts: ['page'],
	id: 'snafuParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*', 'https://ghsprod.service-now.com/incident.do?*', 'https://ghsprod.service-now.com/u_absolute_install.do?*']
});

/**
 * Auto Acknowledge
 */
chrome.contextMenus.create({
	title: 'Auto Acknowledge',
	contexts: ['page'],
	id: 'autoAcknowledge',
	parentId: 'snafuParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*', 'https://ghsprod.service-now.com/incident.do?*', 'https://ghsprod.service-now.com/u_absolute_install.do?*'],
	onclick: actionHandler
});

/**
 * Auto Closure
 */
chrome.contextMenus.create({
	title: 'Auto Close',
	contexts: ['page'],
	id: 'autoClosure',
	parentId: 'snafuParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*', 'https://ghsprod.service-now.com/incident.do?*', 'https://ghsprod.service-now.com/u_absolute_install.do?*'],
	onclick: actionHandler
});

/**
 * Close Hot Swap Task
 */
chrome.contextMenus.create({
	title: 'Close Hot Swap Task',
	contexts: ['page'],
	id: 'closeHotSwapParent',
	parentId: 'snafuParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*']
});

chrome.contextMenus.create({
	title: 'New Device (Out of Box)',
	contexts: ['page'],
	id: 'closeHotSwapNew',
	parentId: 'closeHotSwapParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Repurposed In Stock',
	contexts: ['page'],
	id: 'closeHotSwapRepurposed',
	parentId: 'closeHotSwapParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
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
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*']
});

chrome.contextMenus.create({
	title: 'Decommission Device',
	contexts: ['page'],
	id: 'closeQuarantineDecommission',
	parentId: 'closeQuarantineParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Repair Device',
	contexts: ['page'],
	id: 'closeQuarantineRepair',
	parentId: 'closeQuarantineParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: actionHandler
});

chrome.contextMenus.create({
	title: 'Restock Device',
	contexts: ['page'],
	id: 'closeQuarantineRestock',
	parentId: 'closeQuarantineParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
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

var ticketCompletion = {'save': 'Save', 'update': 'Update', 'auto': 'Automatic', 'none': 'None'};
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
	title: 'Send On Enter',
	contexts: ['page'],
	id: 'sendEnterParent',
	parentId: 'optionsParent'
});

chrome.contextMenus.create({
	title: 'Debug Mode',
	contexts: ['page'],
	id: 'debugParent',
	parentId: 'optionsParent'
});

var toggleOptions = ['closePopup', 'keepNotes', 'sendEnter', 'debug'];
var objToggle = {'enable': 'Enabled', 'disable': 'Disabled'};

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

chrome.contextMenus.create({type: 'separator', parentId: 'optionsParent'});

chrome.contextMenus.create({
	title: 'Options Page',
	contexts: ['page'],
	id: 'optionsPage',
	parentId: 'optionsParent',
	onclick: function() { chrome.tabs.create({url: chrome.extension.getURL('options.html')}); }
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
	title: 'FAQ',
	contexts: ['page'],
	id: 'faqPage',
	parentId: 'helpParent',
	onclick: function() { chrome.tabs.create({url: chrome.extension.getURL('faq.html')}) }
});

chrome.contextMenus.create({
	title: 'Help Page',
	contexts: ['page'],
	id: 'helpPage',
	parentId: 'helpParent',
	onclick: function() { chrome.tabs.create({url: chrome.extension.getURL('help.html')}); }
});

// monitor user data settings to update the context menu
chrome.storage.onChanged.addListener(function(changes, area) {
	if (area === 'sync') {
		if ('userId' in changes) {
			chrome.contextMenus.update('assignIncToMe', {documentUrlPatterns: (isVarEmpty(changes.userId.newValue) === true) ? ['https://make/it/hidden/'] : ['https://ghsprod.service-now.com/incident.do?*']});
			chrome.contextMenus.update('assignTaskToMe', {documentUrlPatterns: (isVarEmpty(changes.userId.newValue) === true) ? ['https://make/it/hidden/'] : ['https://ghsprod.service-now.com/sc_task.do?*']});
			chrome.contextMenus.update('assignSeparator', {documentUrlPatterns: (isVarEmpty(changes.userId.newValue) === true) ? ['https://make/it/hidden/'] : ['https://ghsprod.service-now.com/incident.do?*', 'https://ghsprod.service-now.com/sc_task.do?*']});
			chrome.contextMenus.update('queryOrReset', {
				title: (isVarEmpty(changes.userId.newValue) === true) ? 'Query User Data' : 'Reset User Data',
				onclick: (isVarEmpty(changes.userId.newValue) === true) ? queryUserData : resetUserData
			});
		} else if ('autoFinish' in changes) {
			// set the autofinish radio
			['save', 'update', 'auto', 'none'].forEach(function(opt) {
				chrome.contextMenus.update('autoFinish-' + opt, {checked: (changes.autoFinish.newValue === opt) ? true : false});
			});
		} else if ('closePopup' in changes) {
			// set the closePopup radio
			chrome.contextMenus.update('closePopup-enable', {checked: (changes.closePopup.newValue === true) ? true : false});
			chrome.contextMenus.update('closePopup-disable', {checked: (changes.closePopup.newValue === false) ? true : false});
		} else if ('debug' in changes) {
			// set the debug radio
			chrome.contextMenus.update('debug-enable', {checked: (changes.debug.newValue === true) ? true : false});
			chrome.contextMenus.update('debug-disable', {checked: (changes.debug.newValue === false) ? true : false});
		} else if ('sendEnter' in changes) {
			// set the send on enter radio
			chrome.contextMenus.update('sendEnter-enable', {checked: (changes.sendEnter.newValue === true) ? true : false});
			chrome.contextMenus.update('sendEnter-disable', {checked: (changes.sendEnter.newValue === false) ? true : false});
		} else if ('keepNotes' in changes) {
			// set the keep notes radio
			chrome.contextMenus.update('keepNotes-enable', {checked: (changes.keepNotes.newValue === true) ? true : false});
			chrome.contextMenus.update('keepNotes-disable', {checked: (changes.keepNotes.newValue === false) ? true : false});
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
 * Onclick handler for option menus.
 * @param	{Object}	info
 * @param	{Object}	tabs
 * @return	{Void}
 */
function optionsHandler(info, tab) {
	var setting = info.menuItemId.substring(0, info.menuItemId.indexOf('-'));
	var value = info.menuItemId.substring(info.menuItemId.indexOf('-') + 1);
	if (setting === 'autoFinish') {
		chrome.storage.sync.set({autoFinish: value}, function() {
			if (chrome.runtime.lastError) {
				console.error('SNAFU autoFinish Set Error: %s', chrome.runtime.lastError.message);
			} else {
				console.info('SNAFU: Updated autoFinish.');
			}
		});
	} else {
		var newSetting = {}
		newSetting[setting] = (value === 'enable') ? true : false;
		chrome.storage.sync.set(newSetting, function() {
			if (chrome.runtime.lastError) {
				console.error('SNAFU %s Set Error: %s', setting, chrome.runtime.lastError.message);
			} else {
				console.info('SNAFU: Updated %s.', setting);
			}	
		});
	}

	updateOptionMenus();
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

/**
 * Update option menus.
 * @return	{Void}
 */
function updateOptionMenus() {
	chrome.storage.sync.get(['debug', 'autoFinish', 'closePopup', 'sendEnter', 'keepNotes', 'userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId'], function(items) {
		if (chrome.runtime.lastError) {
			console.error('SNAFU User Sync Error: %s', chrome.runtime.lastError.message);
		} else {
			chrome.contextMenus.update('assignIncToMe', {documentUrlPatterns: (isVarEmpty(items.userId) === true) ? ['https://make/it/hidden/'] : ['https://ghsprod.service-now.com/incident.do?*']});
			chrome.contextMenus.update('assignTaskToMe', {documentUrlPatterns: (isVarEmpty(items.userId) === true) ? ['https://make/it/hidden/'] : ['https://ghsprod.service-now.com/sc_task.do?*']});
			chrome.contextMenus.update('assignSeparator', {documentUrlPatterns: (isVarEmpty(items.userId) === true) ? ['https://make/it/hidden/'] : ['https://ghsprod.service-now.com/incident.do?*', 'https://ghsprod.service-now.com/sc_task.do?*']});
			chrome.contextMenus.update('queryOrReset', {
				title: (isVarEmpty(items.userId) === true) ? 'Query User Data' : 'Reset User Data',
				onclick: (isVarEmpty(items.userId) === true) ? queryUserData : resetUserData
			});

			// set the autofinish radio
			['save', 'update', 'auto', 'none'].forEach(function(opt) {
				chrome.contextMenus.update('autoFinish-' + opt, {checked: (items.autoFinish === opt) ? true : false});
			});

			// set the closePopup radio
			chrome.contextMenus.update('closePopup-enable', {checked: (items.closePopup === true) ? true : false});
			chrome.contextMenus.update('closePopup-disable', {checked: (items.closePopup === false) ? true : false});

			// set the debug radio
			chrome.contextMenus.update('debug-enable', {checked: (items.debug === true) ? true : false});
			chrome.contextMenus.update('debug-disable', {checked: (items.debug === false) ? true : false});

			// set the send on enter radio
			chrome.contextMenus.update('sendEnter-enable', {checked: (items.sendEnter === true) ? true : false});
			chrome.contextMenus.update('sendEnter-disable', {checked: (items.sendEnter === false) ? true : false});

			// set the keep notes radio
			chrome.contextMenus.update('keepNotes-enable', {checked: (items.keepNotes === true) ? true : false});
			chrome.contextMenus.update('keepNotes-disable', {checked: (items.keepNotes === false) ? true : false});
		}
	});
}