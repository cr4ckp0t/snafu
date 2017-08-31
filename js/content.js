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

// incident state ids
// In Progress, On Hold, Resolved
const incStates = ['3', '4', '6'];

// task state ids
// Work in Progress, Pending, Closed Complete, Closed Incomplete
const taskStates = ['2', '-5', '3', '4'];

// data to send
var injectData = {}

// inject the dymo javascript
var dymoInject = document.createElement('script');
dymoInject.src = chrome.runtime.getURL('js/dymo.js');
document.body.appendChild(dymoInject);

// create event to manipulate g_form from the page
var injectScript = document.createElement('script');
injectScript.src = chrome.runtime.getURL('js/inject.js');
(document.head||document.documentElement).appendChild(injectScript);

$(document).ready(function() {
    if (getTicketType() === 'incident') {
        chrome.storage.sync.get(['debug', 'closeAlerts'], function(items) {
            if (items.closeAlerts === true) {
                setTimeout(function() {
                    if (isVarEmpty($('button.config')) === true) {
                        if (items.debug === true) console.info('SNAFU: Sweet Alert not found, skipping.');
                    } else {
                        if (items.debug === true) console.info('SNAFU: Closing Sweet Alert for Hyperspace/BCA devices.');
                        $('button.confirm').click();
                    }
                }, 1000);
            }
        });
    }
});

// build log event trigger
document.addEventListener('SNAFU_BuildLogQuery', function(build) {
    if (isVarEmpty(build.detail.sysId) || isVarEmpty(build.detail.ritm) || isVarEmpty(build.detail.hostname) || isVarEmpty(build.detail.assetTag) || isVarEmpty(build.detail.dateTime) || isVarEmpty(build.detail.build) || isVarEmpty(build.detail.model) || isVarEmpty(build.detail.newUsed)) {
        sendStatusMessage('error', 'Received incorrect data for the build log.');
    } else {
        chrome.storage.sync.get('builds', function(items) {
            if (chrome.runtime.lastError) {
                sendStatusMessage('error', 'Unable to pull build log data.');
            } else {
                items.builds[build.detail.ritm] = {
                    sysId: build.detail.sysId,
                    hostname: build.detail.hostname,
                    assetTag: build.detail.assetTag,
                    dateTime: build.detail.dateTime,
                    build: build.detail.build,
                    model: build.detail.model,
                    newUsed: build.detail.newUsed
                }
                chrome.storage.sync.set({builds: items.builds}, function() {});
            }
        });
    }
});

// listen for triggers on the custom event for passing text
document.addEventListener('SNAFU_UserQuery', function(userData) {
    if (isVarEmpty(userData.detail.fullName) || isVarEmpty(userData.detail.userName) || isVarEmpty(userData.detail.userId) || isVarEmpty(userData.detail.userEmail) || isVarEmpty(userData.detail.groupName) || isVarEmpty(userData.detail.groupId)) {
        console.error('SNAFU: Received incomplete user data.');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: 'sendErrorMsg', statusMsg: 'Received incomplete user data.'}, handleResponse);
        });
    } else {
        chrome.storage.sync.set({
            fullName: userData.detail.fullName,
            userName: userData.detail.userName,
            userId: userData.detail.userId,
            userEmail: userData.detail.userEmail,
            groupName: userData.detail.groupName,
            groupId: userData.detail.groupId
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('SNAFU Sync Set Error: %s', chrome.runtime.lastError.message);
            } else {
                console.info('SNAFU: Received user data.');
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: 'sendSuccessMsg', statusMsg: 'Received technician information.'}, handleResponse);
                });
            }
        });
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    chrome.storage.sync.get(['autoFinish', 'finishDelay', 'buildLog', 'printLabels', 'debug'], function(items) {
        if (chrome.runtime.lastError) {
            console.error('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
        } else {

            if (items.debug === true) {
                console.info('SNAFU: Message received.');
            }

            // get ticket type
            var ticketType = getTicketType();
            
            switch (msg.type) {
                // queries that don't require anything special are handled here
                case 'userQuery':
                case 'savePage':
                case 'updatePage':
                    if (ticketType === false) {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task or incident.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            finishDelay: items.finishDelay || null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;
                
                // send info message
                case 'sendSuccessMsg':
                case 'sendErrorMsg':
                    injectData = {
                        type: msg.type,
                        statusMsg: msg.statusMsg
                    }
                    sendResponse({success: true, errMsg: null});
                    break;

                // assign to me
                case 'assignToMe':
                    if (ticketType === false) {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task or incident.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            userInfo: msg.userInfo
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // auto acknowledge/closure/handle
                case 'autoHandle':
                case 'autoAcknowledge':
                case 'autoEnRoute':
                case 'autoClosure':
                    if (ticketType === false) {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task or incident.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.,
                            buildLog: items.buildLog,
                            printLabels: items.printLabels
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                case 'printLabelBuild':
                case 'printLabelBroken':
                case 'printLabelDecommission':
                case 'printLabelPurchase':
                case 'printLabelReclaim':
                case 'printLabelRepair':
                case 'printLabelRestock':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {type: msg.type}
                        sendResponse({success: true, errMsg: null});
                    }
                    break;
                
                case 'closeHotSwapNew':
                case 'closeHotSwapRepurposed':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3', // closed complete
                            subStatus: msg.subStatus || null,
                            workNotes: 'Computer has been built. One {REPLACE_MODEL} has been built {REPLACE_BUILD}. Tag {REPLACE_ASSET} HostName {REPLACE_HOSTNAME}. Resolving Task.',
                            custNotes: null,
                            buildLog: items.buildLog,
                            printLabels: items.printLabels
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;
                
                // close quarantine task
                case 'closeQuarantineDecommission':
                case 'closeQuarantineRepairYes':
                case 'closeQuarantineRepairNo':
                case 'closeQuarantineRestock':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        var addToNotes;
                        // add the additional message to the quarantine notes
                        if (msg.type === 'closeQuarantineDecommission') {
                            addToNotes = ['and added to the decommission workflow.'];
                        } else if (msg.type === 'closeQuarantineRepairYes') {
                            addToNotes = ['and added to the repair workflow.'];
                        } else if (msg.type === 'closeQuarantineRepairNo') {
                            addToNotes = ['and will be transported to MDC for repairs.'];
                        } else {
                            addToNotes = ['and return to stock for redeployment.'];
                        }

                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3', // closed complete
                            subStatus: msg.subStatus || null,
                            workNotes: sprintf('{BROKEN_HOSTNAME} was removed from quarantine %s', addToNotes),
                            custNotes: null,
                            buildLog: items.buildLog,
                            printLabels: items.printLabels
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // scheduled ticket
                case 'scheduled':
                    if (ticketType === false) {
                        sendResponse({success: false, errMsg: 'Unable to detect task or incident.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: (ticketType === 'incident') ? 'incident_state' : 'state',
                            value: (ticketType === 'incident') ? '4' : '-5',    // on hold or pending
                            subStatus: msg.subStatus || null,
                            custNotes: (ticketType === 'incident') ? sprintf('Scheduled appointment with {INC_CUSTOMER} for %s at %s.', msg.custNotes.split('T')) : sprintf('Scheduled appointment with {REQUESTED_FOR} for %s at %s.', msg.custNotes.split('T')),
                            workNotes: msg.workNotes || null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // send a ticket update
                case 'sendUpdate':
                    // prevent closing incident as incomplete
                    if (ticketType === 'incident' && msg.tState === '3') msg.tState = '2';
                    if (ticketType === false) {
                        sendResponse({success: false, errMsg: 'ServiceNow must be active tab.'});
                    } else {
                        // closing incident, so open resolve information tab
                        if (ticketType === 'incident' && msg.tState === '2') {
                            $('span[class=tab_caption_text]').each(function (index) {
                                if ($(this).parent().hasClass('tabs2_active') && index !== 2) {
                                    $(this).parent().removeClass('tabs2_active');
                                }
                                
                                if (index === 2) {
                                    $(this).parent().addClass('tabs2_active');
                                    $(this).parent().click();
                                }
                            });
                        }

                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: (ticketType === 'incident') ? 'incident_state' : 'state',
                            value: (ticketType === 'incident') ? incStates[parseInt(msg.tState)] : taskStates[parseInt(msg.tState)],
                            subStatus: msg.subStatus || null,
                            workNotes: msg.workNotes || null,
                            custNotes: msg.custNotes || null,
                            buildLog: items.buildLog,
                            printLabels: items.printLabels
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // send an equipment build
                case 'sendEquipment':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3',
                            subStatus: msg.subStatus || null,
                            workNotes: msg.workNotes || null,
                            custNotes: 'My name is {TECH_NAME} and I have completed the build process for your workstation. The next step is for the system to be delivered to our technicians supporting your campus or ambulatory location so they can schedule an appropriate time to come to your desk and install the system. Please be sure to watch for communication regarding the delivery and installation of your computer at your desk.',
                            buildLog: items.buildLog,
                            printLabels: items.printLabels
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                default: 
                    injectData = null;
                    break;
            }
        }

        // prevent any shenanigans
        if (isVarEmpty(injectData) === false || isVarEmpty(injectData.type) === false) {
            // custom event for sending data to the injected script
            var injectEvent = document.createEvent('CustomEvent');
            injectEvent.initCustomEvent('SNAFU_Inject', true, true, injectData);
            document.dispatchEvent(injectEvent);
        } else {
            if (items.debug === true) {
                console.error('SNAFU: Incomplete injectData object.');
                console.error(injectData);
            }
        }
    });
});

/**
 * Determines the type of ticket that is open.
 * @return  {String}
 */
function getTicketType() {
    if (document.getElementById('incident.incident_state') !== null) {
        // it's an incident
        return 'incident';
    } else if (document.getElementById('sc_task.state') !== null || document.getElementById('u_absolute_install.state') !== null) {
        // it's a task
        return 'task';
    } else {
        // it's neither
        return false;
    }
}

/**
 * Checks if a variable is empty (null, undefined, NaN, etc.).
 * @param   {String}    value
 * @return  {Boolean}
 */
function isVarEmpty(value) {
    return (value === null || value === undefined || value === NaN ) ? true : false
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
 * Sends a message interpreted as a info/error message in Service Now.
 * @param   {String}    status
 * @param   {String}    msg
 * @return  {Void}
 */
function sendStatusMessage(status, msg) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {type: 'send' + ucWords(status) + 'Msg', statusMsg: msg}, handleResponse);
	});
}

/**
 * Capitalizes the first character of each word.
 * @param	{String}	str
 * @return	{String}
 */
function ucWords(str) {
	return str.toLowerCase().replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function(e) {
		return e.toUpperCase();
	});
}