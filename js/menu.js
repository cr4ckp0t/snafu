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

// auto acknowledge task
chrome.contextMenus.create({
	title: 'SNAFU: Acknowledge Task',
	contexts: ['page'],
	//parentId: 'parent',
	id: 'ackTask',
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