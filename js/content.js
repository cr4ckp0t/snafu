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
var incStates = ['3', '4', '6'];

// task state ids
// Work in Progress, Pending, Closed Complete, Closed Incomplete
var taskStates = ['2', '-5', '3', '4'];

// data to send
var injectData = {}

// create event to manipulate g_form from the page
var injectScript = document.createElement('script');
injectScript.src = chrome.extension.getURL('js/inject.js');
injectScript.onload = function() { this.remove(); };
(document.head||document.documentElement).appendChild(injectScript);

// listen for triggers on the custom event for passing text
document.addEventListener('SNAFU_UserQuery', function(userData) {
    if (isVarEmpty(userData.detail.fullName) || isVarEmpty(userData.detail.userName) || isVarEmpty(userData.detail.userId) || isVarEmpty(userData.detail.userEmail) || isVarEmpty(userData.detail.groupName) || isVarEmpty(userData.detail.groupId)) {
        console.error('SNAFU: Received incomplete user data.');
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
            }
        });
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    chrome.storage.sync.get(['autoFinish', 'finishDelay', 'debug'], function(items) {
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
                            finishDelay: msg.finishDelay || null
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

                // acknowledge incident
                case 'ackIncident':
                    if (ticketType !== 'incident') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open incident.'});
                    } else {
                        // set the data to inject
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'incident_state',
                            value: '3', // In Progress
                            workNotes: 'Acknowledging incident.',
                            custNotes: null
                        }
                        // send the response
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                case 'ackCallUser':
                    if (ticketType !== 'incident') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open incident..'});
                    } else {
                        // set the data to inject
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'incident_state',
                            value: '3', // In Progress
                            workNotes: 'Acknowledging Incident.  Calling {INC_CUSTOMER} at {INC_CUR_PHONE}.',
                            custNotes: null
                        }
                        // send the response
                        sendResponse({success: true, errMsg: null});
                    }
                    break;
            
                // acknowledge task
                case 'ackTask':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '2', // Work in Progress
                            workNotes: 'Acknowledging task.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;
            
                // acknowledge build
                case 'ackHotSwap':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '2', // work in progress
                            workNotes: 'Acknowledging build request.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;
                
                // acknowledge install task
                case 'ackInstall':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '2', // work in progress
                            workNotes: 'Acknowledging install task.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // acknowledge equipment move
                case 'ackMove':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '2', // work in progress
                            workNotes: 'Acknowledging equipment move task.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // acknowledge quarantine
                case 'ackQuarantine':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '2', // work in progress
                            workNotes: 'Acknowledging quarantine task.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // acknowledge reclaim
                case 'ackReclaim':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '2', // work in progress
                            workNotes: 'Acknowledging reclaim task.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // acknowledge reimage only build
                case 'ackReimage':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '2', // work in progress
                            workNotes: 'Acknowledging reimage only build task.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;


                // acknowledge equipment removal
                case 'ackRemoval':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '2', // work in progress
                            workNotes: 'Acknowledging equipment removal task.',
                            custNotes: null
                        }
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
                            workNotes: 'Computer has been built. One {REPLACE_MODEL} has been built {REPLACE_BUILD}. Tag {REPLACE_ASSET} HostName {REPLACE_HOSTNAME}. Resolving Task.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // close install task
                case 'closeInstall':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3', // closed complete
                            workNotes: 'Installed requested equipment and attached signed completion sheet.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // close equipment move task
                case 'closeMove':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3', // closed complete
                            workNotes: 'Equipment has been moved, per the request.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;
                
                // close quarantine task
                case 'closeQuarantineDecommission':
                case 'closeQuarantineRepair':
                case 'closeQuarantineRestock':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        // add the additional message to the quarantine notes
                        if (msg.type === 'closeQuarantineDecommission') {
                            var addToNotes = ['and added to the decommission workflow.'];
                        } else if (msg.type === 'closeQuarantineRepair') {
                            var addToNotes = ['and added to the repair workflow.'];
                        } else {
                            var addToNotes = ['and return to stock for redeployment.'];
                        }

                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3', // closed complete
                            workNotes: sprintf('Device removed from quarantine %s', addToNotes),
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // close reclaim task (hot swap)
                case 'closeReclaimHotSwap':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3', // closed complete
                            workNotes: 'Device reclaimed and added to quarantine.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;
                
                // close reclaim task (reimage only)
                case 'closeReclaimReimage':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3', // closed complete
                            workNotes: 'Device reclaimed for reimage.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;

                // close reimage only build
                case 'closeReimage':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3', // closed complete
                            workNotes: 'Computer has been built. One {BROKEN_MODEL} has been built {REPLACE_BUILD}. Tag {BROKEN_ASSET} HostName {BROKEN_HOSTNAME}. Resolving Task.',
                            custNotes: null
                        }
                        sendResponse({success: true, errMsg: null});
                    }
                    break;
                
                // close equipment removal
                case 'closeRemoval':
                    if (ticketType !== 'task') {
                        sendResponse({success: false, errMsg: 'Unable to detect an open task.'});
                    } else {
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: 'state',
                            value: '3',
                            workNotes: 'Removed requested equipment.',
                            custNotes: null
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
                        injectData = {
                            type: msg.type,
                            autoFinish: items.autoFinish || 'none',
                            finishDelay: items.finishDelay || 1.5,
                            field: (ticketType === 'incident') ? 'incident_state' : 'state',
                            value: (ticketType === 'incident') ? incStates[parseInt(msg.tState)] : taskStates[parseInt(msg.tState)],
                            workNotes: msg.workNotes || null,
                            custNotes: msg.custNotes || null
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
                            workNotes: msg.workNotes || null,
                            custNotes: 'My name is {TECH_NAME} and I have completed the build process for your workstation. The next step is for the system to be delivered to our technicians supporting your campus or ambulatory location so they can schedule an appropriate time to come to your desk and install the system. Please be sure to watch for communication regarding the delivery and installation of your computer at your desk.'
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
        if (isVarEmpty(injectData) === false && isVarEmpty(injectData.type) === false) {
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
    } else if (document.getElementById('sc_task.state') !== null) {
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