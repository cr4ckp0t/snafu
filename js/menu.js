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

var autoFinish

var arrAckTasks = ['ackTask|Generic Task', 'ackHotSwap|Hot Swap', 'ackInstall|Install Task', 'ackQuarantine|Quarantine Task', 'ackReclaim|Reclaim Task'];
var arrCloseTasks = ['closeHotSwap|Hot Swap', 'closeInstall|Install Task', 'closeQuarantine|Quarantine Task', 'closeReclaim|Reclaim Task'];

chrome.storage.sync.get({autoTicket: 'none'}, function(items) {
	autoFinish = (items.autoTicket === undefined) ? 'none' : items.autoFinish;
});

// auto acknowledge incident
chrome.contextMenus.create({
	title: 'SNAFU: Acknowledge Incident',
	contexts: ['page'],
	//parentId: 'parent',
	id: 'ackIncident',
	documentUrlPatterns: ['https://ghsprod.service-now.com/incident.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'ackIncident',
				autoFinish: autoFinish
			});
		});
	}
});

chrome.contextMenus.create({
	title: 'Acknowledge Tasks',
	contexts: ['page'],
	//parentId: 'parent',
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
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'ackTask',
				autoFinish: autoFinish
			});
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
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'ackHotSwap',
				autoFinish: autoFinish
			});
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
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'ackInstall',
				autoFinish: autoFinish
			});
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
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'ackQuarantine',
				autoFinish: autoFinish
			});
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
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'ackReclaim',
				autoFinish: autoFinish
			});
		});
	}
});

// closure tasks
chrome.contextMenus.create({
	title: 'Close Tasks',
	contexts: ['page'],
	id: 'parentCloseTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*']
});

chrome.contextMenus.create({
	title: 'Hot Swap',
	contexts: ['page'],
	id: 'closeHotSwap',
	parentId: 'parentCloseTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'closeHotSwap',
				autoFinish: autoFinish
			});
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
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'closeInstall',
				autoFinish: autoFinish
			});
		});
	}
});

chrome.contextMenus.create({
	title: 'Quarantine Task',
	contexts: ['page'],
	id: 'closeQuarantine',
	parentId: 'parentCloseTask',
	documentUrlPatterns: ['https://ghsprod.service-now.com/sc_task.do?*'],
	onclick: function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'closeQuarantine',
				autoFinish: autoFinish
			});
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
			chrome.tabs.sendMessage(tabs[0].id, {
				type: 'closeReclaim',
				autoFinish: autoFinish
			});
		});
	}
});