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
    // incident state ids
    // In Progress, On Hold, Resolved
    var incStates = ['3', '4', '6'];
    // task state ids
    // Work in Progress, Pending, Closed Complete, Closed Incomplete
    var taskStates = ['2', '-5', '3', '4'];
    // custom event for sending data to the injected script
    var injectEvent = document.createEvent('CustomEvent');
    // data to send
    var injectData = {}

     // create event to pull g_form from the page for manipulation
    var injectScript = document.createElement('script');
    injectScript.src = chrome.extension.getURL('js/inject.js');
    injectScript.onload = function() { this.remove(); };
    (document.head||document.documentElement).appendChild(injectScript);
    
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        var ticketType = getTicketType();
        
        switch (msg.type) {
            // acknowledge incident
            case 'ackIncident':
                if (ticketType !== 'incident') {
                    sendResponse({success: false, errMsg: 'Please open an incident.'});
                } else {
                    // set the data to inject
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: 'incident_state',
                        value: '3', // In Progress
                        workNotes: 'Acknowledging Incident.',
                        custNotes: null
                    }
                    // send the response
                    sendResponse({success: true, errMsg: null});
                }
                break;

            case 'ackCallUser':
                if (ticketType !== 'incident') {
                    sendResponse({success: false, errMsg: 'Please open an incident.'});
                } else {
                    // set the data to inject
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: 'incident_state',
                        value: '3', // In Progress
                        workNotes: 'Acknowledging Incident.  Calling {ENDUSER} at {NUMBER}.',
                        custNotes: null
                    }
                    // send the response
                    sendResponse({success: true, errMsg: null});
                }
                break;
        
            // acknowledge task
            case 'ackTask':
                if (ticketType !== 'task') {
                    sendResponse({success: false, errMsg: 'Please open a task.'});
                } else {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
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
                    sendResponse({success: false, errMsg: 'Please open a task.'});
                } else {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: 'state',
                        value: '2', // work in progress
                        workNotes: 'Acknowledging build request.',
                        custNotes: null
                    }
                    sendResponse({success: true, errMsg: null});
                }
                break;

            // acknowledge quarantine
            case 'ackQuarantine':
                if (ticketType !== 'task') {
                    sendResponse({success: false, errMsg: 'Please open a task.'});
                } else {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
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
                    sendResponse({success: false, errMsg: 'Please open a task.'});
                } else {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: 'state',
                        value: '2', // work in progress
                        workNotes: 'Acknowledging reclaim task.',
                        custNotes: null
                    }
                    sendResponse({success: true, errMsg: null});
                }
                break;
            
            case 'closeHotSwap':
                if (ticketType !== 'task') {
                    sendResponse({success: false, errMsg: 'Please open a task.'});
                } else {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: 'state',
                        value: '3', // closed complete
                        workNotes: 'Computer has been built. One {MODEL} has been built {BUILD}. Tag {ASSET} HostName {HOSTNAME}. Resolving Task.',
                        custNotes: null
                    }
                    sendResponse({success: true, errMsg: null});
                }
                break;

            // close install task
            case 'closeInstall':
                if (ticketType !== 'task') {
                    sendResponse({success: false, errMsg: 'Please open a task.'});
                } else {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: 'state',
                        value: '3', // closed complete
                        workNotes: 'Installed requested equipment and attached signed completion sheet.',
                        custNotes: null
                    }
                    sendResponse({success: true, errMsg: null});
                }
                break;
            
            // close quarantine task
            case 'closeQuarantine':
                if (ticketType !== 'task') {
                    sendResponse({success: false, errMsg: 'Please open a task.'});
                } else {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: 'state',
                        value: '3', // closed complete
                        workNotes: 'Device removed from quarantine.',
                        custNotes: null
                    }
                    sendResponse({success: true, errMsg: null});
                }
                break;

            // close reclaim task
            case 'closeReclaim':
                if (ticketType !== 'task') {
                    sendResponse({success: false, errMsg: 'Please open a task.'});
                } else {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: 'state',
                        value: '3', // closed complete
                        workNotes: 'Device reclaimed and added to quarantine.',
                        custNotes: null
                    }
                    sendResponse({success: true, errMsg: null});
                }
                break;

            // send a ticket update
            case 'sendUpdate':
                // prevent closing incident as incomplete
                if (ticketType === 'incident' && msg.tState === '3') msg.tState = '2';
                if (ticketType !== false) {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: (ticketType === 'incident') ? 'incident_state' : 'state',
                        value: (ticketType === 'incident') ? incStates[parseInt(msg.tState)] : taskStates[parseInt(msg.tState)],
                        workNotes: msg.workNotes || null,
                        custNotes: msg.custNotes || null
                    }
                    sendResponse({success: true, errMsg: null});
                } else {
                    // send error
                    sendResponse({success: false, errMsg: 'Service Now must be active tab.'});
                }
                break;

            // send an equipment build
            case 'sendEquipment':
                if (ticketType !== 'task') {
                    sendResponse({success: false, errMsg: 'Please open a task.'});
                } else {
                    injectData = {
                        type: msg.type,
                        autoFinish: msg.autoFinish,
                        field: 'state',
                        value: '3',
                        workNotes: msg.workNotes || null,
                        custNotes: 'My name is {TECHNAME} and I have completed the build process for your workstation. The next step is for the system to be delivered to our technicians supporting your campus or ambulatory location so they can schedule an appropriate time to come to your desk and install the system. Please be sure to watch for communication regarding the delivery and installation of your computer at your desk.'
                    }
                    sendResponse({success: true, errMsg: null});
                }
                break;

            default: 
                injectData = null;
                break;
        }

        // prevent any shenanigans
        if (injectData !== null) {
            injectEvent.initCustomEvent('SNAFU_Inject', true, true, injectData);
            document.dispatchEvent(injectEvent);
        }
    });
});

function getTicketType() {
    if ($('#incident\\.incident_state').length) {
        // it's an incident
        return 'incident';
    } else if ($('#sc_task\\.state').length) {
        // it's a task
        return 'task';
    } else {
        return false;
    }
}

function isValueEmpty(value) {
    return (value === null || value === undefined || value === NaN || value.trim() === '') ? true : false
}