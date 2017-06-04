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
 *  We have to use ServiceNow's g_form JavaScript object in order to
 *  access fields and inputs correctly.  Chrome extensions do not
 *  access to page variables, so we have to inject code and use Custom Events
 *  to pass data between the extension and the page.
 **/

var snafuRslvComments = "My name is {TECH_NAME} and I was the technician that assisted you with {TICKET}. Thank you for the opportunity to provide you with service today with your {INC_TYPE}. If for any reason, your issue does not appear to be resolved please contact the Service Desk at (864) 455-8000.";
var snafuAutoTickets = {
	// misc
	'generic_task': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging task.',
			'value': '2'
		},
		'close': null
	},
	'generic_incident': {
		'field': 'incident_state',
		'ack': {
			'script': 'Acknowledging incident.',
			'value': '3'
		},
		'close': null
	},
	'general_request': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging general request task.',
			'value': '2'
		},
		'close': null
	},

	// equipment move/remove
	'equip_removal': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging equipment removal.',
			'value': '2'
		},
		'close': {
			'script': 'Equipment removed, per the customer\'s request.',
			'value': '3'
		}
	},
	'equip_disconnect': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging equipment disconnect task.',
			'value': '2'
		},
		'close': {
			'script': 'Equipment disconnected, per the customer\'s request.',
			'value': '3'
		}
	},
	'equip_reconnect': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging equipment reconnect task.',
			'value': '2'
		},
		'close': {
			'script': 'Equipment reconnected and tested, per the customer\'s request.',
			'value': '3'
		}
	},

	// reimage only workflow
	'rhs_reclaim_reimage':	{
		'field': 'state',
		'ack': {
			'script': 'Acknowledging reclaim for device reimage.',
			'value': '2'
		},
		'close': {
			'script': 'Device has been reclaimed for reimaging.',
			'value': '3'
		}
	},
	'rhs_reimage': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging reimage task.',
			'value': '2'
		},
		'close': {
			'script': 'Computer has been built. One {BROKEN_MODEL} has been built {REPLACE_BUILD}. Tag {BROKEN_ASSET} HostName {BROKEN_HOSTNAME}. Resolving Task.',
			'value': '3'
		}
	},
	'rhs_reimage_return': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging reimage return task.',
			'value': '2'
		},
		'close': {
			'script': 'Device has been returned to the customer.',
			'value': '3'
		}
	},

	// asset management workflow
	'rhs_build': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging build request.',
			'value': '2'
		},
		'close': null
	},
	'rhs_reclaim': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging reclaim task.',
			'value': '2'
		},
		'close': {
			'script': '{BROKEN_HOSTNAME} has been reclaimed and added to quarantine.',
			'value': '3'
		}
	},
	'rhs_restock': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging quarantine task.',
			'value': '2'
		},
		'close': null
	},
	'rhs_repair': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging repair task.',
			'value': '2'
		},
		'close': {
			'script': '{BROKEN_HOSTNAME} has been repaired and returned to stock.',
			'value': '3'
		}
	},
	'rhs_decommission': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging decommission task.',
			'value': '2'
		},
		'close': {
			'script': '{BROKEN_HOSTNAME} has been decommissioned.',
			'value': '3'
		}
	},

	// mdc deliver workflow
	'1st_deliver_mdc': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging MDC Staging delivery task.',
			'value': '2'
		},
		'close': null
	},
	'deliver_mdc': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging MDC Disposal task.',
			'value': '2'
		},
		'close': null
	},

	// purchase order workflow
	'po_configure_pc': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging equipment configuration task.',
			'value': '2'
		},
		'close': null
	},
	'po_deploy_items': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging equipment delivery task.',
			'value': '2'
		},
		'close': null
	},
	'po_install_items': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging equipment install task.',
			'value': '2'
		},
		'close': {
			'script': 'Installed equipment and attached signed completion sheet.',
			'value': '3'
		}
	},

	// spr workflow
	'spr_configure': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging SPR configuration task.',
			'value': '2'
		},
		'close': null
	},
	'spr_delivery': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging SPR delivery task.',
			'value': '2'
		},
		'close': null
	},
	'spr_install': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging SPR install task.',
			'value': '2'
		},
		'close': {
			'script': 'Completed SPR installation.',
			'value': '3'
		}
	},

	// equipment pull workflow
	'equip_pull': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging equipment pull request.',
			'value': '2'
		},
		'close': {
			'script': 'Equipment pulled for delivery.',
			'value': '3'
		}
	},

	// loaner workflow
	'loaner_build': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging loaner request build.',
			'value': '2'
		},
		'close': null
	},
	'loaner_deploy': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging loaner deployment task.',
			'value': '2'
		},
		'close': null
	},
	'loaner_reclaim': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging loaner reclaim task.',
			'value': '2'
		},
		'close': {
			'script': 'Loaner device reclaimed.',
			'value': '3'
		}
	},

	// install absolute task
	'absolute_install': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging Absolute install request.',
			'value': '2'
		},
		'close': {
			'script': 'Absolute installation completed on {ABS_MACHINE}.',
			'value': '3'
		}
	}
}

// listen for triggers on the custom event for passing text
document.addEventListener('SNAFU_Inject', function(snafuInject) {
	// query for the user informatoin
	if (snafuInject.detail.type === 'userQuery') {
		var snafuAssignedTo = g_form.getReference('assigned_to');
		var snafuAssignmentGroup = g_form.getReference('assignment_group');

		if (snafuIsVarEmpty(snafuAssignedTo.name) === false && snafuIsVarEmpty(snafuAssignmentGroup.name) === false) {
			// query the user info sent by the options page
			var snafuQuery = document.createEvent('CustomEvent');
			snafuQuery.initCustomEvent('SNAFU_UserQuery', true, true, {
				fullName: snafuUcwords(snafuAssignedTo.name),
				userId: snafuAssignedTo.sys_id,
				userName: snafuAssignedTo.user_name,
				userEmail: snafuAssignedTo.email,
				groupName: snafuUcwords(snafuAssignmentGroup.name),
				groupId: snafuAssignmentGroup.sys_id
			});
			snafuInfoMessage('Saved your user information.');
			document.dispatchEvent(snafuQuery);
		} else {
			snafuErrorMessage('SNAFU: Unable to pull your user information or incomplete information found.');
		}
	
	// assign task or incident to the user
	} else if (snafuInject.detail.type === 'assignToMe') {
		snafuSetDisplayValue('assignment_group', snafuInject.detail.userInfo.groupId, snafuInject.detail.userInfo.groupName);
		snafuFlash('assignment_group');
		snafuSetDisplayValue('assigned_to', snafuInject.detail.userInfo.userId, snafuInject.detail.userInfo.fullName.toUpperCase());
		snafuFlash('assigned_to');
		switch (snafuInject.detail.autoFinish) {
			case 'auto':
			case 'save':
				setTimeout(function() { g_form.save(); }, 1000);
				break;
			case 'update':
				setTimeout(function() { g_form.submit(); }, 1000);
				break;
			case 'none':
			default:
				break;
		}

	// send success (info) messagea
	} else if (snafuInject.detail.type === 'sendSuccessMsg') {
		snafuInfoMessage(snafuInject.detail.statusMsg);
	
	// send error message
	} else if (snafuInject.detail.type === 'sendErrorMsg') {
		snafuErrorMessage(snafuInject.detail.statusMsg);

	// save the page (via keybinding)
	} else if (snafuInject.detail.type === 'savePage') {
		snafuInfoMessage(snafuSprintf('Saving page in %s seconds.  Please wait...', [snafuInject.detail.finishDelay]));
		setTimeout(function() { g_form.save(); }, snafuInject.detail.finishDelay * 1000);

	// update the page (via keybinding)
	} else if (snafuInject.detail.type === 'updatePage') {
		snafuInfoMessage(snafuSprintf('Updating page in %s seconds.  Please wait...', [snafuInject.detail.finishDelay]));
		setTimeout(function() { g_form.submit(); }, snafuInject.detail.finishDelay * 1000);

	// auto ticket detection
	} else if (snafuInject.detail.type === 'autoAcknowledge' || snafuInject.detail.type === 'autoClosure') {
		var snafuTicketType = snafuGetTicketType();
		if (snafuTicketType === false) {
			snafuErrorMessage('No task or incident detected.');
		} else {
			if (snafuTicketType in snafuAutoTickets) {
				var snafuTicket = snafuAutoTickets[snafuTicketType];
				var snafuTicketAction = (snafuInject.detail.type === 'autoAcknowledge') ? snafuTicket.ack : snafuTicket.close;
				console.info(snafuTicketAction);
				console.info(snafuInject.detail.type);
				if (snafuIsVarEmpty(snafuTicketAction) === true) {
					snafuErrorMessage(snafuSprintf('Unable to complete action "%s" on this ticket type (%s).', [snafuInject.detail.type, snafuTicketType]));
				} else {
					// set the field with value
					if (snafuIsVarEmpty(snafuTicket.field) === false && snafuIsVarEmpty(snafuTicketAction.value) === false) {
						snafuSetValue(snafuTicket.field, snafuTicketAction.value);
						snafuFlash(snafuTicket.field);
					}

					// set the work notes
					if (snafuIsVarEmpty(snafuTicketAction.script) === false) {
						snafuSetValue('work_notes', snafuReplaceWildcards(snafuTicketAction.script));
						snafuFlash('work_notes');
					}

					// if a task, set root cause ci and due date
					if (snafuTicket.field === 'state') {
						var snafuDueDate = snafuGetDueDate();

						// due date
						if (g_form.getValue('due_date') !== snafuDueDate) {
							snafuSetValue('due_date', snafuDueDate);
							snafuFlash('due_date');
						}

						// root cause ci
						// desktop services value is 5a8d6816a1cf38003a42245d1035d56e
						if (snafuTicketType !== 'absolute_install' && g_form.getValue('cmdb_ci') !== '5a8d6816a1cf38003a42245d1035d56e') {
							snafuSetDisplayValue('cmdb_ci', '5a8d6816a1cf38003a42245d1035d56e', 'Desktop Services');
							snafuFlash('cmdb_ci');
						}
					}

					// autofinish
					switch (snafuInject.detail.autoFinish) {
						// save (stay on ticket's page)
						case 'save':
							// not going to let incidents be autosaved
							if (snafuTicket.field === 'state' || (snafuTicket.field === 'incident_state' && snafuTicketAction.value !== '6')) {
								// delay 1.5 seconds
								setTimeout(function() { g_form.save(); }, snafuInject.detail.finishDelay * 1000);
							}
							break;
						
						// update (go back to last page)
						case 'update':
							// not going to let incident be autoupdated
							if (snafuTicket.field === 'state' || (snafuTicket.field === 'incident_state' && snafuTicketAction.value !== '6')) {
								// delay 1.5 seconds
								setTimeout(function() { g_form.submit(); }, snafuInject.detail.finishDelay * 1000);
							}
							break;

						// auto (save all updates except closures, which are updated. incidents are never automatically resolved)
						case 'auto':
							// if a closure then update, otherwise save
							if (snafuTicket.field === 'state' && (snafuTicketAction.value === '3' || snafuTicketAction.value === '4')) {
								// update
								setTimeout(function() { g_form.submit(); }, snafuInject.detail.finishDelay * 1000);
							} else if (snafuTicket.field === 'state' || (snafuTicket.field === 'incident_state' && snafuTicketAction.value !== '6')) {
								setTimeout(function() { g_form.save(); }, snafuInject.detail.finishDelay * 1000);
							}
							break;
						
						// neither
						case 'none':
						default:
							break;
					}
				}					
			} else {
				snafuErrorMessage('Unknown ticket type detected.');
			}
		}

	// handle everything else
	} else {
		// make sure ticket is assigned
		if (g_form.getReference('assigned_to').currentRow === -1) {
			snafuErrorMessage('Unable to send update to unassigned ticket.  Please assign it to yourself and try again.');
		} else {
			var snafuTicketType = snafuGetTicketType();
			var snafuType = snafuInject.detail.type;
			var snafuField = snafuInject.detail.field;
			var snafuValue = snafuInject.detail.value;
			var snafuWorkNotes = (snafuIsVarEmpty(snafuInject.detail.workNotes) === false) ? snafuReplaceWildcards(snafuInject.detail.workNotes) : null;
			var snafuCustNotes = (snafuIsVarEmpty(snafuInject.detail.custNotes) === false) ? snafuReplaceWildcards(snafuInject.detail.custNotes) : null;

			if (snafuType.indexOf('closeQuarantine') !== -1 && snafuTicketType !== 'rhs_restock') {
				snafuErrorMessage('Open ticket is not for a quarantined asset');
			} else if (snafuType.indexOf('closeHotSwap') !== -1 && snafuTicketType !== 'rhs_build') {
				snafuErrorMessage('Open ticket is not for a Hot Swap build.');
			} else {

				// set field with value
				if (snafuIsVarEmpty(snafuField) === false && snafuIsVarEmpty(snafuValue) === false) {
					snafuSetValue(snafuField, snafuValue);
					snafuFlash(snafuField)
				}

				// customer notes (comments)
				if (snafuIsVarEmpty(snafuCustNotes) === false) {
					snafuSetValue('comments', snafuCustNotes);
					snafuFlash('comments');
				}

				// work notes
				if (snafuIsVarEmpty(snafuWorkNotes) === false) {
					snafuSetValue('work_notes', snafuWorkNotes);
					snafuFlash('work_notes');
				}

				// set the resolve message if it is a resolved code (incident only)
				if (snafuField === 'incident_state' && snafuValue === '6') {
					snafuSetValue('comments', snafuReplaceWildcards(snafuRslvComments));
					snafuFlash('comments');

					// set to Problem Resolved
					snafuSetValue('close_code', 'Problem Resolved');
					snafuFlash('close_code');

					// spoke to customer
					snafuSetValue('u_customer_communication', 'Spoke to Customer');
					snafuFlash('u_customer_communication');

					if (snafuIsVarEmpty(snafuWorkNotes) === false) {
						snafuSetValue('close_notes', snafuWorkNotes);
						snafuFlash('close_notes');
					}
				}

				// change the root cause ci and due date for tasks
				if (snafuField === 'state') {
					var snafuDueDate = snafuGetDueDate();

					// due date
					if (g_form.getValue('due_date') !== snafuDueDate) {
						snafuSetValue('due_date', snafuDueDate);
						snafuFlash('due_date');
					}

					// root cause ci
					// desktop services value is 5a8d6816a1cf38003a42245d1035d56e
					if (g_form.getValue('cmdb_ci') !== '5a8d6816a1cf38003a42245d1035d56e') {
						snafuSetDisplayValue('cmdb_ci', '5a8d6816a1cf38003a42245d1035d56e', 'Desktop Services');
						snafuFlash('cmdb_ci');
					}

					// set quarantine select, if needed
					if (snafuType.indexOf('closeQuarantine') !== -1) {
						snafuSetValue('rhs_restock_status', snafuType.replace('closeQuarantine', '').toLowerCase());
					} else if (snafuType.indexOf('closeHotSwap') !== -1) {
						snafuSetValue('rhs_replacement_type', snafuType.replace('closeHotSwap', '').toLowerCase());
					}
				}

				// autofinish
				switch (snafuInject.detail.autoFinish) {
					// save (stay on ticket's page)
					case 'save':
						// not going to let incidents be autosaved
						if (snafuField === 'state' || (snafuField === 'incident_state' && snafuValue !== '6')) {
							// delay 1.5 seconds
							setTimeout(function() { g_form.save(); }, snafuInject.detail.finishDelay * 1000);
						}
						break;
					
					// update (go back to last page)
					case 'update':
						// not going to let incident be autoupdated
						if (snafuField === 'state' || (snafuField === 'incident_state' && snafuValue !== '6')) {
							// delay 1.5 seconds
							setTimeout(function() { g_form.submit(); }, snafuInject.detail.finishDelay * 1000);
						}
						break;

					// auto (save all updates except closures, which are updated. incidents are never automatically resolved)
					case 'auto':
						// if a closure then update, otherwise save
						if (snafuField === 'state' && (snafuValue === '3' || snafuValue === '4')) {
							// update
							setTimeout(function() { g_form.submit(); }, snafuInject.detail.finishDelay * 1000);
						} else if (snafuField === 'state' || (snafuField === 'incident_state' && snafuValue !== '6')) {
							setTimeout(function() { g_form.save(); }, snafuInject.detail.finishDelay * 1000);
						}
						break;
					
					// neither
					case 'none':
					default:
						break;
				}
			}
		}
	}
});

/**
 * Returns string appropriate for Due Date field. XX-XX-XXXX XX:XX:XX
 * @return	{String}
 */
function snafuGetDueDate() {
    var d = new Date();
    return ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + '-' + d.getFullYear() + ' 17:00:00';
}

/**
 * Replaces wildcards with eval'd strings.
 * @param	{String}	strIn
 * @return	{String}
 */
function snafuReplaceWildcards(strIn) {
	// object containing the code to be eval'd as a replacement for the wildcards
	var wildcards = {
		// global
		"{ASSIGN_GROUP}": "g_form.getReference('assignment_group').name || 'UNKNOWN';",										// assignment group
		"{OPENED}": "g_form.getValue('opened_at') || 'UNKNOWN';",															// date/time ticket opened
		"{OPENED_BY}": "g_form.getValue('opened_by_label') || 'UNKNOWN';",													// who opened the ticket
		"{ROOT_CAUSE}": "g_form.getReference('cmdb_ci').name || 'UNKNOWN';",												// root cause ci field
		"{TECH_NAME}": "snafuUcwords(g_form.getReference('assigned_to').name) || 'UNKNOWN';",								// technician's name
		"{TICKET}": "g_form.getValue('number') || 'UNKNOWN';",																// task/incident number

		//incident only
		"{INC_ADDR}": "snafuUcwords(g_form.getReference('u_street_address').u_name) || 'UNKNOWN';",							// incident street address
		"{INC_ADD_LOC}": "g_form.getValue('u_location_description') || 'UNKNOWN';",											// incident additional location information
		"{INC_ALT_PHONE}": "g_form.getValue('u_alternate_phone') || 'UNKNOWN';",											// alternative phone number
		"{INC_CAMPUS}": "g_form.getValue('u_campus') || 'UNKNOWN';",														// campus
		"{INC_CUR_PHONE}": "g_form.getValue('u_current_phone') || 'UNKNOWN';",												// current phone number
		"{INC_CUSTOMER}": "snafuUcwords(g_form.getReference('caller_id').name) || 'UNKNOWN';",								// customer who called in the incident
		"{INC_CUST_FNAME}": "snafuUcwords(g_form.getReference('caller_id').first_name) || 'UNKNOWN';",						// customer's first name
		"{INC_CUST_LNAME}": "snafuUcwords(g_form.getReference('caller_id').last_name) || 'UNKNOWN';",						// customer's last name
		"{INC_DETAIL_DESC}": "g_form.getValue('description') || 'UNKNOWN';",												// detailed description
		"{INC_EMAIL}": "g_form.getReference('caller_id').email.toLowerCase() || 'UNKNOWN';",								// customer's email
		"{INC_IMPACT}": "g_form.getValue('impact') || 'UNKNOWN';",															// incident impact
		"{INC_KB}": "g_form.getReference('u_kb_article').number || 'UNKNOWN';",												// knowledgebase article
		"{INC_LOC_TYPE}": "g_form.getValue('u_location_type') || 'UNKNOWN';",												// location type
		"{INC_PRACTICE}": "snafuUcwords(g_form.getReference('u_practice_name').name) || 'UNKNOWN';",						// practice name
		"{INC_PRIORITY}": "g_form.getValue('priority') || 'UNKNOWN';",														// incident priority
		"{INC_SHORT_DESC}": "g_form.getValue('short_description') || 'UNKNOWN';",											// short description
		"{INC_STATE}": "g_form.getDisplayValue('incident_state') || 'UNKNOWN';",											// incident state
		"{INC_TYPE}": "g_form.getValue('u_incident_type') || 'UNKNOWN';",													// incident type
		"{INC_TYPE_2}": "g_form.getValue('u_incident_type_2') || 'UNKNOWN';",												// incident type 2
		"{INC_TYPE_3}": "g_form.getValue('u_incident_type_3') || 'UNKNOWN';",												// incident type 3
		"{INC_URGENCY}": "g_form.getValue('urgency') || 'UNKNOWN';",														// incident urgency

		// task only	
		"{CATEGORY_ITEM}": "g_form.getValue('cat_item') || 'UNKNOWN';",														// category item
		"{DUE_DATE}": "g_form.getValue('due_date') || 'UNKNOWN';",															// due date
		"{REQUEST_ITEM}": "g_form.getValue('request_item') || 'UNKNOWN';",													// ritm number
		"{REQUESTED_BY}": "snafuUcwords(g_form.getReference('requested_for').name) || 'UNKNOWN';",							// task requested by
		"{REQUESTED_FOR}": "snafuUcwords(g_form.getReference('u_requested_for').name) || 'UNKNOWN';",						// task requested for
		"{TASK_STATE}": "g_form.getDisplayValue('state') || 'UNKNOWN';",													// task state

		// hot swap only
		"{BROKEN_ASSET}": "g_form.getReference('rhs_comp_name').asset_tag || 'UNKNOWN';",									// broken computer asset tag
		"{BROKEN_HOSTNAME}": "g_form.getReference('rhs_comp_name').name || 'UNKNOWN';",										// broken computer hostname
		"{BROKEN_MODEL}": "snafuGetComputerModel(g_form.getReference('rhs_comp_name').model_id) || 'UNKNOWN';",				// broken computer model
		"{BROKEN_SERIAL}": "g_form.getReference('rhs_comp_name').serial_number || 'UNKNOWN';",								// broken computer serial number
		"{RELATED_INC}": "g_form.getReference('rhs_inc').number || 'UNKNOWN';",												// incident requiring hot swap
		"{REPLACE_ASSET}": "g_form.getReference('rhs_replacement_computer').asset_tag || 'UNKNOWN';",						// replacement computer asset tag
		"{REPLACE_BUILD}": "g_form.getValue('rhs_software') || 'UNKNOWN';",													// replacement computer build
		"{REPLACE_CUSTOMER}": "snafuUcwords(g_form.getReference('rhs_user').name) || 'UNKNOWN';",							// user requiring the hot swap
		"{REPLACE_HOSTNAME}": "g_form.getReference('rhs_replacement_computer').name || 'UNKNOWN';",							// replacement computer hostname
		"{REPLACE_MODEL}": "snafuGetComputerModel(g_form.getReference('rhs_replacement_computer').model_id) || 'UNKNOWN';",	// replacement computer model
		"{REPLACE_SERIAL}": "g_form.getReference('rhs_replacement_computer').serial_number || 'UNKNOWN';",					// replacement computer serial number

		// miscellaneous
		"{ABS_MACHINE}": "g_form.getReference('cmdb_ci').name || 'UNKNOWN';"												// absolute install device											
	};
	
	// use regular expressions to find matches and send them for processing
	return strIn.replace(/\{(.+?)\}/g, function(match) {
		// if the match is found in the wildcards then it will eval the code and return the output
		// if not, then it will be replaced with UNKNOWN (to prevent shenanigans)
		return (match in wildcards) ? eval(wildcards[match]) : 'UNKNOWN';
	});	
}

/**
 * Queries cmdb_model ServiceNow database for model types.
 * @param	{String}	model_id
 * @return	{String}
 */
function snafuGetComputerModel(model_id) {
	var model = new GlideRecord('cmdb_model');
	model.addQuery('sys_id', model_id);
	model.query();
	return (model.next()) ? model.name : 'UNKNOWN';
}

/**
 * Checks if a variable is empty (null, undefined, NaN, etc.).
 * @param   {String}    value
 * @return  {Boolean}
 */
function snafuIsVarEmpty(value) {
    return (value === null || value === undefined || value === NaN) ? true : false
}

/**
 * Capitalizes the first character of each word.
 * @param	{String}	str
 * @return	{String}
 */
function snafuUcwords(str) {
	return str.toLowerCase().replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function(e) {
		return e.toUpperCase();
	});
}

/**
 * Javascript sprintf function.
 * @param   {String}    template
 * @param   {String[]}  values
 * @return  {String}
 */
function snafuSprintf(template, values) {
    return template.replace(/%s/g, function() {
        return values.shift();
    });
}

/**
 * Set field value.
 * @param	{String}	field
 * @param	{String}	value
 * @return	{Void}
 */
function snafuSetValue(field, value) {
	g_form.setValue(field, value);
}

/**
 * Set field with display value.
 * @param	{String}	field
 * @param	{String}	value
 * @param	{String}	displayValue
 * @return	{Void}
 */
function snafuSetDisplayValue(field, value, displayValue) {
	g_form.setValue(field, value, displayValue);
}

/**
 * Service Now input field flash.
 * @param	{String}	field
 * @return	{Void}
 */
function snafuFlash(field) {
	g_form.flash(field, '#3eb049', 0);
}

/**
 * Sends Service Now info message.
 * @param	{String}	msg
 * @return	{Void}
 */
function snafuInfoMessage(msg) {
	g_form.addInfoMessage(snafuSprintf('SNAFU: %s', [msg]));
}

/**
 * Sends Service Now error message.
 * @param	{String}	msg
 * @return	{Void}
 */
function snafuErrorMessage(msg) {
	g_form.addErrorMessage(snafuSprintf('SNAFU Error: %s', [msg]));
}

/**
 * Determines the type of ticket that is open.
 * @return  {String}
 */
function snafuGetTicketType() {
    if (document.getElementById('incident.incident_state') !== null) {
        // it's an incident
        return 'generic_incident';
    } else if (document.getElementById('sc_task.state') !== null) {
        // it's a trap! (task)
		var snafuShortDesc = g_form.getValue('short_description');
		if (snafuShortDesc.indexOf('Equipment Move/Remove') !== -1) {
			return 'equip_removal';
		} else if (snafuShortDesc.indexOf('Disconnect System') !== -1) {
			return 'equip_disconnect';
		} else if (snafuShortDesc.indexOf('Reconnect System') !== -1) {
			return 'equip_reconnect';
		} else {
        	var snafuTaskName = g_form.getValue('u_task_name').toLowerCase();
			return (snafuTaskName in snafuAutoTickets) ? snafuTaskName : 'generic_task';
		}
	} else if (document.getElementById('u_absolute_install.state') !== null) {
		return 'absolute_install';
    } else {
        // it's neither
        return false;
    }
}