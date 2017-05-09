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

var debug

chrome.storage.sync.get(['debug'], function(items) {
	if (chrome.runtime.lastError) {
		console.warn('SNAFU debug Get Error: %s', chrome.runtime.lastError.message);
	} else {
		debug = (isVarEmpty(items.debug) === false) ? items.debug : false;
	}
});

// uber parent
chrome.contextMenus.create({
	title: 'SNAFU',
	contexts: ['page'],
	id: 'snafuParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*', 'https://ghsprod.service-now.com/incident.do?*']
});

// auto acknowledge incident
chrome.contextMenus.create({
	title: 'Acknowledge Incident',
	contexts: ['page'],
	parentId: 'snafuParent',
	id: 'parentAckIncident',
	documentUrlPatterns: ['https://ghsprod.service-now.com/incident.do?*']
});

// acknowledge generic incident
chrome.contextMenus.create({
	title: 'Generic Incident',
	contexts: ['page'],
	id: 'ackIncident',
	parentId: 'parentAckIncident',
	documentUrlPatterns: ['https://ghsprod.service-now.com/incident.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'ackIncident'}, handleResponse);
		});
	}
});

// acknowledge incident - call end user
chrome.contextMenus.create({
	title: 'Call End User',
	contexts: ['page'],
	id: 'ackCallUser',
	parentId: 'parentAckIncident',
	documentUrlPatterns: ['https://ghsprod.service-now.com/incident.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'ackCallUser'}, handleResponse);
		});
	}
});

// parent for acknowledge tasks
chrome.contextMenus.create({
	title: 'Acknowledge Tasks',
	contexts: ['page'],
	parentId: 'snafuParent',
	id: 'parentAckTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*']
});

chrome.contextMenus.create({
	title: 'Generic Task',
	contexts: ['page'],
	id: 'ackTask',
	parentId: 'parentAckTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'ackTask'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Equipment Move',
	contexts: ['page'],
	id: 'ackMove',
	parentId: 'parentAckTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'ackMove'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Equipment Removal',
	contexts: ['page'],
	id: 'ackRemoval',
	parentId: 'parentAckTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'ackRemoval'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Hot Swap',
	contexts: ['page'],
	id: 'ackHotSwap',
	parentId: 'parentAckTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'ackHotSwap'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Install Task',
	contexts: ['page'],
	id: 'ackInstall',
	parentId: 'parentAckTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'ackInstall'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Quarantine Task',
	contexts: ['page'],
	id: 'ackQuarantine',
	parentId: 'parentAckTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'ackQuarantine'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Reclaim Task',
	contexts: ['page'],
	id: 'ackReclaim',
	parentId: 'parentAckTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'ackReclaim'}, handleResponse);
		});
	}
});

// closure tasks
chrome.contextMenus.create({
	title: 'Close Tasks',
	contexts: ['page'],
	id: 'parentCloseTask',
	parentId: 'snafuParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*']
});

chrome.contextMenus.create({
	title: 'Equipment Move',
	contexts: ['page'],
	id: 'closeMove',
	parentId: 'parentCloseTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'closeMove'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Equipment Removal',
	contexts: ['page'],
	id: 'closeRemoval',
	parentId: 'parentCloseTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'closeRemoval'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Hot Swap',
	contexts: ['page'],
	id: 'closeHotSwap',
	parentId: 'parentCloseTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'closeHotSwap'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Install Task',
	contexts: ['page'],
	id: 'closeInstall',
	parentId: 'parentCloseTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'closeInstall'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Quarantine Task',
	contexts: ['page'],
	id: 'closeQuarantineParent',
	parentId: 'parentCloseTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*']
});

chrome.contextMenus.create({
	title: 'Decommission Device',
	contexts: ['page'],
	id: 'closeQuarantineDecom',
	parentId: 'closeQuarantineParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'closeQuarantineDecommission'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Repair Device',
	contexts: ['page'],
	id: 'closeQuarantineRepair',
	parentId: 'closeQuarantineParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'closeQuarantineRepair'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Restock Device',
	contexts: ['page'],
	id: 'closeQuarantineRestock',
	parentId: 'closeQuarantineParent',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'closeQuarantineRestock'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Reclaim Task',
	contexts: ['page'],
	id: 'closeReclaim',
	parentId: 'parentCloseTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {type: 'closeReclaim'}, handleResponse);
		});
	}
});

chrome.contextMenus.create({
	title: 'Assignments',
	contexts: ['page'],
	id: 'assignParent',
	parentId: 'snafuParent'
});

chrome.storage.sync.get(['debug', 'userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId'], function(items) {
	if (chrome.runtime.lastError) {
		console.warn('SNAFU User Sync Error: %s', chrome.runtime.lastError.message);
	} else {
		if (isVarEmpty(items.userId) || isVarEmpty(items.userName) || isVarEmpty(items.userEmail) || isVarEmpty(items.fullName) || isVarEmpty(items.groupName) || isVarEmpty(items.groupId)) {
			if (items.debug === true) {
				console.info('SNAFU:  User info not found, adding query option.');
			}
			chrome.contextMenus.create({
				title: 'Query User Info',
				contexts: ['page'],
				id: 'userQuery',
				parentId: 'assignParent',
				onclick: function() {
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id, {type: 'userQuery'}, handleResponse)
					});
				}
			});
		} else {
			if (items.debug === true) {
				console.info('SNAFU:  User info found, adding Assign To Me menu.');
			}
			chrome.contextMenus.create({
				title: 'Assign Incident To Me',
				contexts: ['page'],
				id: 'assignIncToMe',
				parentId: 'assignParent',
				documentUrlPatterns: ['https://ghsprod.service-now.com/incident.do?*'],
				onclick: function() {
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id, {
							type: 'assignToMe',
							userInfo: {
								userId: items.userId,
								userName: items.userName,
								fullName: items.fullName,
								userEmail: items.userEmail,
								groupId: items.groupId,
								groupName: items.groupName
							}
						}, handleResponse);
					});
				}
			});

			chrome.contextMenus.create({
				title: 'Assign Task To Me',
				contexts: ['page'],
				id: 'assignTaskToMe',
				parentId: 'assignParent',
				documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
				onclick: function() {
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

			chrome.contextMenus.create({
				title: 'Reset User Data',
				contexts: ['page'],
				id: 'resetUserData',
				parentId: 'assignParent',
				onclick: function() {
					chrome.storage.sync.remove(['userId', 'userName', 'userEmail', 'fullName', 'groupName', 'groupId'], function() {
						if (chrome.runtime.lastError) {
							console.warn('SNAFU Sync Remove Error: %s', chrome.runtime.lastError.message);
							chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
								chrome.tabs.sendMessage(tabs[0].id, {
									type: 'sendErrorMsg',
									statusMsg: 'Failed to reset your user data.'
								}, handleResponse);
							});
						} else {
							if (items.debug === true) {
								console.info('SNAFU: Removed user data.');
							}
							chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
								chrome.tabs.sendMessage(tabs[0].id, {
									type: 'sendSuccessMsg',
									statusMsg: 'Successfully reset your user data.'
								}, function(response) {
									chrome.contextMenus.remove(['resetUserData', 'assignTaskToMe', 'assignIncToMe']);
									chrome.contextMenus.create({
										title: 'Query User Info',
										contexts: ['page'],
										id: 'userQuery',
										parentId: 'snafuParent',
										onclick: function() {
											chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
												chrome.tabs.sendMessage(tabs[0].id, {type: 'userQuery'}, handleResponse)
											});
										}
									});
									handleResponse(response);
								});
							});
						}
					});
				}
			});
		}
	}
});

chrome.contextMenus.create({type:'separator', parentId: 'snafuParent'});

chrome.contextMenus.create({
	title: 'Help',
	contexts: ['page'],
	id: 'helpParent',
	parentId: 'snafuParent'
});

chrome.contextMenus.create({
	title: 'Options',
	contexts: ['page'],
	id: 'optionsPage',
	parentId: 'helpParent',
	onclick: function() { chrome.tabs.create({url: chrome.extension.getURL('options.html')}); }
});

chrome.contextMenus.create({
	title: 'Help',
	contexts: ['page'],
	id: 'helpPage',
	parentId: 'helpParent',
	onclick: function() { chrome.tabs.create({url: chrome.extension.getURL('help.html')}); }
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
			console.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {
			if (items.debug === true) {
				if (isVarEmpty(response) === false) {
					if (response.success === false) {
						console.warn('SNAFU Error: %s', response.errMsg);
					} else {
						console.info('SNAFU: Update sent!');
					}
				} else {
					console.warn('SNAFU Error: Unable to process response to message.');
				}
			}
		}
	});
}