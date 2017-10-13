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
 const snafuAutoTickets = { 
	// misc
	'generic_task': {
		field: 'state',
		ack: { script: 'Acknowledging task.', value: '2' },
		enRoute: { script: 'En route to complete task', value: '2' },
		pending: { script: 'Placing task on hold.', value: '-5' },
		close: null
	},
	'generic_incident': {
		field: 'incident_state',
		ack: { script: 'Acknowledging incident.', value: '3' },
		enRoute: { script: 'En route to troubleshoot the device.', value: '3' },
		pending: null,
		close: null
	},
	'general_request': {
		field: 'state',
		ack: { script: 'Acknowledging general request task.', value: '2' },
		enRoute: { script: 'En route to complete the general request.', value: '2' },
		pending: { script: 'Placing general request on hold.', value: '-5' },
		close: null
	},

	// equipment move/remove
	'equip_removal': {
		field: 'state',
		ack: { script: 'Acknowledging equipment removal.', value: '2' },
		enRoute: { script: 'En route to complete equipment removal', value: '2' },
		pending: { script: 'Placing equipment removal request on hold.', value: '-5' },
		close: { script: 'Equipment removed, per {REQUESTED_BY}\'s request.', value: '3' }
	},
	'equip_disconnect': {
		field: 'state',
		ack: { script: 'Acknowledging equipment disconnect task.', value: '2' },
		enRoute: { script: 'En route to complete equipment disconnect.', value: '2' },
		pending: { script: 'Placing equipment disconnect request on hold.', value: '-5' },
		close: { script: 'Equipment disconnected, per {REQUESTED_BY}\'s request.', value: '3' }
	},
	'equip_reconnect': {
		field: 'state',
		ack: { script: 'Acknowledging equipment reconnect task.', value: '2' },
		enRoute: { script: 'En route to complete equipment reconnect.', value: '2' },
		pending: { script: 'Placing equipment reconnect request on hold.', value: '-5' },
		close: { script: 'Equipment reconnected and tested, per {REQUESTED_BY}\'s request.', value: '3' }
	},
	
	// reimage only workflow
	'rhs_reclaim_reimage':	{
		field: 'state',
		ack: { script: 'Acknowledging reclaim for device reimage.', value: '2' },
		enRoute: { script: 'En route to complete reimage reclaim.', value: '2' },
		pending: null,
		close: { script: '{BROKEN_HOSTNAME} has been reclaimed for reimaging.', value: '3' }
	},
	'rhs_reimage': {
		field: 'state',
		ack: { script: 'Acknowledging reimage task.', value: '2' },
		enRoute: null,
		pending: null,
		close: { script: 'Computer has been built. One {BROKEN_MODEL} has been built {REPLACE_BUILD}. Tag {BROKEN_ASSET} HostName {BROKEN_HOSTNAME}. Resolving Task.', value: '3' }
	},
	'rhs_reimage_return': {
		field: 'state',
		ack: { script: 'Acknowledging reimage return task.', value: '2' },
		enRoute: { script: 'En route to return {BROKEN_HOSTNAME}.', value: '2' },
		pending: null,
		close: { script: 'Device has been returned to the customer.', value: '3' }
	},

	// asset management workflow
	'rhs_build': {
		field: 'state',
		ack: { script: 'Acknowledging build request.', value: '2' },
		enRoute: null,
		pending: null,
		close: null
	},
	'rhs_reclaim': {
		field: 'state',
		ack: { script: 'Acknowledging reclaim task.', value: '2' },
		enRoute: { script: 'En route to complete {BROKEN_HOSTNAME} reclaim.', value: '2' },
		pending: null,
		close: { script: '{BROKEN_HOSTNAME} has been reclaimed and added to quarantine.', value: '3' }
	},
	'rhs_restock': {
		field: 'state',
		ack: { script: 'Acknowledging quarantine task.', value: '2' },
		enRoute: null,
		pending: null,
		close: null
	},
	'rhs_repair': {
		field: 'state',
		ack: { script: 'Acknowledging repair task.', value: '2' },
		enRoute: null,
		pending: { script: 'Placing repair task on hold.', value: '-5' },
		close: null
	},
	'rhs_decommission': {
		field: 'state',
		ack: { script: 'Acknowledging decommission task.', value: '2' },
		enRoute: null,
		pending: { script: 'Placing decommission task on hold.', value: '-5' },
		close: { script: '{BROKEN_HOSTNAME} has been decommissioned.', value: '3' }
	},

	// mdc deliver workflow
	'1st_deliver_mdc': {
		field: 'state',
		ack: { script: 'Acknowledging MDC Staging delivery task.', value: '2' },
		enRoute: { script: 'En route to complete MDC Staging delivery.', value: '2' },
		pending: { script: 'Placing delivery task on hold.', value: '-5' },
		close: null
	},
	'deliver_mdc': {
		field: 'state',
		ack: { script: 'Acknowledging MDC Disposal task.', value: '2' },
		enRoute: null,
		pending: { script: 'Placing disposal task on hold.', value: '-5' },
		close: null
	},

	// purchase order workflow
	'purchasing_review': {
		field: 'state',
		ack: { script: 'Acknowledging purchase review task.', value: '2' },
		enRoute: null,
		pending: null,
		close: null
	},

	'po_configure_pc': {
		field: 'state',
		ack: { script: 'Acknowledging equipment configuration task.', value: '2' },
		enRoute: null,
		pending: null,
		close: null
	},
	'po_deploy_items': {
		field: 'state',
		ack: { script: 'Acknowledging equipment delivery task.', value: '2' },
		enRoute: { script: 'En route to complete equipment delivery.', value: '2' },
		pending: { script: 'Placing equipment delivery task on hold.', value: '-5' },
		close: { script: 'Delivered equipment to {REQUESTED_FOR_CAMPUS} Staging. Desktop Support will call End User and set up date and time to install equipment.', value: '3' }
	},
	'po_install_items': {
		field: 'state',
		ack: { script: 'Acknowledging equipment install task.', value: '2' },
		enRoute: { script: 'En route to complete equipment installation.', value: '2' },
		pending: { script: 'Placing equipment install task on hold.', value: '-5' },
		close: { script: 'Installed equipment and attached signed completion sheet.', value: '3' }
	},

	// spr workflow
	'spr_configure': {
		field: 'state',
		ack: { script: 'Acknowledging SPR configuration task.', value: '2' },
		enRoute: null,
		pending: null,
		close: null
	},
	'spr_delivery': {
		field: 'state',
		ack: { script: 'Acknowledging SPR delivery task.', value: '2' },
		enRoute: { script: 'En route to complete SPR delivery.', value: '2' },
		pending: { script: 'Placing SPR delivery task on hold.', value: '-5' },
		close: { script: 'Delivered equipment to {REQUESTED_FOR_CAMPUS} Staging. Desktop Support will call End User and set up date and time to install equipment.', value: '3' }
	},
	'spr_install': {
		field: 'state',
		ack: { script: 'Acknowledging SPR install task.', value: '2' },
		enRoute: { script: 'En route to complete SPR installation.', value: '2' },
		pending: { script: 'Placing SPR install task on hold.', value: '-5' },
		close: { script: 'Completed SPR installation and attached signed completion sheet.', value: '3' }
	},

	// equipment pull workflow
	'equip_pull': {
		field: 'state', ack: { script: 'Acknowledging equipment pull request.', value: '2' },
		enRoute: null,
		pending: null,
		close: { script: 'Equipment pulled for delivery.', value: '3' }
	},

	// loaner workflow
	'loaner_build': {
		field: 'state',
		ack: { script: 'Acknowledging loaner request build.', value: '2' },
		enRoute: null,
		pending: null,
		close: null
	},
	'loaner_deploy': {
		field: 'state',
		ack: { script: 'Acknowledging loaner deployment task.', value: '2' },
		enRoute: { script: 'En route to complete loaner deployment.', value: '2' },
		pending: { script: 'Placing loaner deployment task on hold.', value: '-5' },
		close: { script: 'Delivered requested loaner device(s) and attached signed loaner form.', value: '3' }
	},
	'loaner_reclaim': {
		field: 'state',
		ack: { script: 'Acknowledging loaner reclaim task.', value: '2' },
		enRoute: { script: 'En route to complete loaner reclaim.', value: '2' },
		pending: { script: 'Placing loaner reclaim task on hold.', value: '-5' },
		close: { script: 'Loaner device reclaimed.', value: '3' }
	},

	// install absolute task
	'absolute_install': {
		field: 'state',
		ack: { script: 'Acknowledging Absolute install request.', value: '2' },
		enRoute: null,
		pending: null,
		close: { script: 'Absolute installation completed on {ABS_MACHINE}.', value: '3' }
	},
	
	// application install request
	'app_install': {
		field: 'state',
		ack: { script: 'Acknowledging application install request.', value: '2' },
		enRoute: { script: 'Installing requested application on the device.', value: '2' },
		pending: { script: 'Placing application install request on hold.', value: '-5' },
		close: { script: 'Completed the requested software installation.', value: '3' }
	},

	// cancelled task (when closing workflow as incomplete)
	'cancelled_task': {
		field: 'state',
		ack: { script: 'Acknowledging cancelled task workflow.', value: '2' },
		enRoute: null,
		pending: null,
		close: { script: 'Updated {BROKEN_HOSTNAME}\'s location information.', value: '3' }
	},

	// application access request
	'app_not_listed_access': {
		field: 'state',
		ack: { script: 'Acknowledging Application Access request.', value: '2' },
		enRoute: null,
		pending: { script: 'Placing Application Access request on hold.', value: '-5' },
		close: null
	},

	// smart hands request
	'smart_hands': {
		field: 'state',
		ack: { script: 'Acknowledging Smart Hands request.', value: '2' },
		enRoute: { script: 'En route to complete the Smart Hands request.', value: '2' },
		pending: { script: 'Placing Smart Hands request on hold.', value: '-5' },
		close: { script: 'Completed Smart Hands request.', value: '3' }
	}
}

// dymo label fields
const snafuLabelFields = {
	// broken equipment
	'broken': {
		'ticketType': true,			// to force correct printing
		'TICKET': '{TICKET}',		// ticket number
		'TECH': '{LABEL_INC_TECH}',	// technician
		'EQUIP': ''			 		// reason the equipment stopped working
	},

	// replacement build acknowledgement
	'buildack': {
		'ticketType': ['rhs_build'],		// to force correct printing
		'RITM': '{REQUEST_ITEM}',			// ritm
		'TECH': '{LABEL_TECH}',				// tech's name
		'BUILD': '{REPLACE_BUILD}',			// build type
		'MODEL': '{BROKEN_MODEL}',			// model of broken device
		'APPS': '{REPLACE_SOFTWARE}',		// additional applications
		'ENDUSER': '{REPLACE_CUSTOMER}',	// end user
	},

	// replacement build
	'build': {
		'ticketType': ['rhs_build'],			// to force correct printing
		'HOSTNAME_TEXT': '{REPLACE_HOSTNAME}',	// replacement build's hostname
		'TEXT_3': '{LABEL_TECH}',				// technician
		'TEXT_4': '{REPLACE_BUILD}',			// replacement os and build
		'RITM#': '{REQUEST_ITEM}',				// ritm number
		'TEXT_2': '{REPLACE_CUSTOMER}',			// customer
		'TEXT_8': '{REPLACE_SOFTWARE}'			// software
	},

	// decommission
	'decommission': {
		'ticketType': ['rhs_restock', 'rhs_decommission', 'rhs_repair'],	// to force correct printing
		'TEXT': '{BROKEN_SERIAL}',											// asset serial being decommissioned
		'Tech': '{LABEL_TECH}',												// technician
		'TEXT_5': 'Decommission asset.',									// reason
		'RITM#': '{REQUEST_ITEM}'											// ritm number
	},

	// equipment configuration
	'equipment': {
		'ticketType': ['po_configure_pc'],		// to force correct printing
		'HOSTNAME_TEXT': '{REPLACE_HOSTNAME}',	// replacement build's hostname
		'TEXT_3': '{LABEL_INC_TECH}',			// technician
		'TEXT_4': '{REPLACE_BUILD}',			// replacement os and build
		'RITM#': '{REQUEST_ITEM}',				// ritm number
		'TEXT_2': '{REQUESTED_FOR}',			// customer
		'TEXT_8': '{REPLACE_SOFTWARE}'			// software
	},

	// purchase orders
	'purchase': {
		'ticketType': true,			// to force correct printing
		'RITM': '{REQUEST_ITEM}',	// ritm number
		'PO': '{PLACEHOLDER}',		// user will be prompted for this
		'MORE_PO': '{PLACEHOLDER}'	// user will be prompted for this
	},

	// prebuilt device
	'prebuilt': {
		'ticketType': true,					// to force correct printing
		'BUILD_TYPE': '{PREBUILT_BUILD}',	// placeholder
		'HOSTNAME': '{PREBUILT_HOST}',		// placeholder
		'ASSET_TAG': '{PREBUILT_ASSET}'		// placeholder
	},

	// reclaim task
	'reclaim': {
		'ticketType': ['rhs_reclaim', 'loaner_reclaim'],	// to force correct printing
		'TEXT':	'{BROKEN_SERIAL}',							// reclaimed asset's serial number
		'Tech': '{LABEL_TECH}',								// technician
		'TEXT_5': '{RECLAIM_REASON}',						// reason for reclaiming
		'RITM#': '{REQUEST_ITEM}'							// ritm number
	},

	// reimage ack
	'reimageack': {
		'ticketType': ['rhs_reimage'],		// to force correct printing
		'RITM': '{REQUEST_ITEM}',			// ritm
		'TECH': '{LABEL_TECH}',				// tech's name
		'BUILD': '{REPLACE_BUILD}',			// build type
		'MODEL': '{BROKEN_MODEL}',			// model of broken device
		'APPS': '{REPLACE_SOFTWARE}',		// additional applications
		'ENDUSER': '{REPLACE_CUSTOMER}',	// end user
	},

	// reimage
	'reimage': {
		'ticketType': ['rhs_reimage'],			// to force correct printing
		'HOSTNAME_TEXT': '{BROKEN_HOSTNAME}',	// replacement build's hostname
		'TEXT_3': '{LABEL_TECH}',				// technician
		'TEXT_4': '{REPLACE_BUILD}',			// replacement os and build
		'RITM#': '{REQUEST_ITEM}',				// ritm number
		'TEXT_2': '{REPLACE_CUSTOMER}',			// customer
		'TEXT_8': '{REPLACE_SOFTWARE}'			// software
	},

	// repair task
	'repair': {
		'ticketType': ['rhs_restock', 'rhs_repair'],	// to force correct printing
		'TEXT': '{BROKEN_SERIAL}',						// asset being repaired's serial number
		'Tech': '{LABEL_TECH}',							// technician
		'TEXT_5': '{REPAIR_REASON}',					// repair reason
		'RITM#': '{REQUEST_ITEM}'						// ritm number
	},

	// restock task
	'restock': {
		'ticketType': ['rhs_restock', 'rhs_repair'],	// to force correct printing
		'TEXT': '{BROKEN_SERIAL}',						// restocked asset's serial number
		'Tech': '{LABEL_TECH}',							// technician
		'TEXT_5': 'Passed UEFI diagnostics.',			// repair results
		'RITM#': '{REQUEST_ITEM}'						// ritm number
	}
}

// attempt to set the resolve types via the root cause ci
const snafuResolveTypes = {
	// hardware types
	'DT': { 'type_1': 'Hardware', 'type_2': 'Desktop' },
	'LT': { 'type_1': 'Hardware', 'type_2': 'Laptop' },
	'TB': { 'type_1': 'Hardware', 'type_2': 'Tablet' },

	// generic hardware
	'keyboard': { 'type_1': 'Hardware', 'type_2': 'Keyboard' },
	'monitor': { 'type_1': 'Hardware', 'type_2': 'Monitor' },
	'mouse': { 'type_1': 'Hardware', 'type_2': 'Mouse' },
	'barcode': { 'type_1': 'Hardware', 'type_2': 'Scanner-W' },
	'scanner': { 'type_1': 'Hardware', 'type_2': 'Scanner-W' },

	// printers
	'logic': { 'type_1': 'Software', 'type_2': 'Configuration' },
	'printer': { 'type_1': 'Hardware', 'type_2': 'Printer' },
}

// tickets that will trigger a reminder to update the location information
const snafuReminderTickets = [
	'generic_incident',
	'rhs_reimage_return',
	'rhs_build',
	'rhs_reclaim',
	'rhs_restock',
	'rhs_repair',
	'rhs_decommission',
	'po_install_items',
	'spr_install',
	'equip_removal',
	'equip_reconnect'
];

// listen for triggers on the custom event for passing text
document.addEventListener('SNAFU_Inject', function(inject) {
	var ticketType = snafuGetTicketType();
	var type = inject.detail.type;
	var labelSettings = inject.detail.labels;
	var labelType, query;

	// incomplete inject data
	if (!inject.detail) {
		snafuErrorMessage('Injected script received incomplete data. Stopping execution.');
	} else {

		switch (type) {

			/**
			 * basic error handling
			 */
			case 'error':
				snafuErrorMessage(inject.detail.errMsg);
				break;

			/**
			 * pull technician info from ticket
			 */
			case 'userQuery':
				var assignedTo = g_form.getReference('assigned_to');
				var assignmentGroup = g_form.getReference('assignment_group');

				if (!snafuIsVarEmpty(assignedTo.name) && !snafuIsVarEmpty(assignmentGroup.name)) {
					// query the user info sent by the options page
					query = document.createEvent('CustomEvent');
					query.initCustomEvent('SNAFU_UserQuery', true, true, {
						fullName: snafuUcwords(assignedTo.name),
						userId: assignedTo.sys_id,
						userName: assignedTo.user_name,
						userEmail: assignedTo.email,
						groupName: snafuUcwords(assignmentGroup.name),
						groupId: assignmentGroup.sys_id
					});
					snafuInfoMessage('Saved your user information.');
					document.dispatchEvent(query);
				} else {
					snafuErrorMessage('SNAFU: Unable to pull your user information or incomplete information found.');
				}
				break;
	
			
			/**
			 * assign ticket to oneself
			 */
			case 'assignToMe':
				snafuSetDisplayValue('assignment_group', inject.detail.userInfo.groupId, inject.detail.userInfo.groupName);
				snafuFlash('assignment_group');
				snafuSetDisplayValue('assigned_to', inject.detail.userInfo.userId, inject.detail.userInfo.fullName.toUpperCase());
				snafuFlash('assigned_to');
				switch (inject.detail.autoFinish) {
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
				break;

			/**
			 * send success (info) message
			 */
			case 'sendSuccessMsg':
				snafuInfoMessage(inject.detail.statusMsg);
				break;
	
			/**
			 * send error message
			 */
			case 'sendErrorMsg':
				snafuErrorMessage(inject.detail.statusMsg);
				break;

			/**
			 * save the page via keybinding
			 */
			case 'savePage':
				snafuInfoMessage(snafuSprintf('Saving page in %s seconds.  Please wait...', [inject.detail.finishDelay]));
				setTimeout(function() { g_form.save(); }, inject.detail.finishDelay * 1000);
				break;

			/**
			 * update the page via keybinding
			 */
			case 'updatePage':
				snafuInfoMessage(snafuSprintf('Updating page in %s seconds.  Please wait...', [inject.detail.finishDelay]));
				setTimeout(function() { g_form.submit(); }, inject.detail.finishDelay * 1000);
				break;

			/**
			 * Print Label From Context Menu
			 */
			case 'printLabelBroken':
			case 'printLabelBuild':
			case 'printLabelBuildAck':
			case 'printLabelDecommission':
			case 'printLabelPurchase':
			case 'printLabelPrebuilt':
			case 'printLabelReclaim': 
			case 'printLabelRestock': 
			case 'printLabelRepair':
				if (!ticketType) {
					snafuErrorMessage('The open ticket is not valid for label printing.');
				} else {
					// make sure we have a valid printer
					if (snafuHasValidPrinter() === true) {
						// determine the label type from the ticket type
						labelType = (ticketType === 'rhs_reimage' && (type === 'printLabelBuild' || type === 'printLabelBuildAck')) ? type.replace('printLabelBuild', 'reimage').toLowerCase() : type.replace('printLabel', '').toLowerCase();
						snafuPrintLabel(ticketType, labelType);
					} else {
						console.warn('SNAFU: No appropriate printers were found.  Skipping print job. . .');
						snafuErrorMessage('No appropriate printers were found.  Skipping print job. . .');
					}
				}
				break;

			/**
			 * auto ticket handling
			 */
			case 'autoEnRoute':
			case 'autoHandle':
			case 'autoAcknowledge':
			case 'autoClose':
			case 'autoPending':
				if (!ticketType) {
					snafuErrorMessage('No task or incident detected.');
				} else if (ticketType in snafuAutoTickets) {
					var ticket = snafuAutoTickets[ticketType];
					var error = false;
					// determine ack or close
					if (type === 'autoHandle') {
						var ticketStatus = (ticketType === 'generic_incident') ? g_form.getValue('incident_state') : g_form.getValue('state');
						if (ticketType === 'generic_incident') {
							if (ticketStatus === '6') {
								// if ticket is resolved then abort
								error = true;
							} else {
								// if status is 1 (New) or 2 (Assigned) then auto-acknowledge, otherwise auto-close
								type = (ticketStatus === '1' || ticketStatus === '2') ? 'autoAcknowledge' : 'autoClose';
							} 
						} else {
							if (ticketStatus === '3' || ticketStatus === '4') {
								// if ticket is closed then abort
								error = true;
							} else {
								// if status is 1 (Open) then auto-acknowledge, otherwise auto-close
								type = (ticketStatus === '1') ? 'autoAcknowledge' : 'autoClose';
								//console.log(type, ticketStatus)
							}
						}
					}

					if (error === true) {
						snafuErrorMessage('Ticket has already been closed.');
					} else {
						var ticketAction = ticket[snafuGetTicketAction(type)];
						
						if (snafuIsVarEmpty(ticketAction) === true) {
							snafuErrorMessage(snafuSprintf('Unable to complete action "%s" on this ticket type (%s).', [type, ticketType]));
						} else {
							// set the field with value
							if (!snafuIsVarEmpty(ticket.field) && !snafuIsVarEmpty(ticketAction.value)) {
								snafuSetValue(ticket.field, ticketAction.value);
								snafuFlash(ticket.field);
							}

							// set the work notes
							if (!snafuIsVarEmpty(ticketAction.script)) {
								snafuSetValue('comments', snafuReplaceWildcards(ticketAction.script));
								snafuFlash('comments');
							}

							// if a task, set root cause ci and due date
							if (ticket.field === 'state') {
								var dueDate = snafuGetDueDate();

								// due date
								if (g_form.getValue('due_date') !== dueDate) {
									snafuSetValue('due_date', dueDate);
									snafuFlash('due_date');
								}

								// root cause ci
								// desktop services value is 5a8d6816a1cf38003a42245d1035d56e
								if (ticketType !== 'absolute_install' && g_form.getValue('cmdb_ci') !== '5a8d6816a1cf38003a42245d1035d56e') {
									snafuSetDisplayValue('cmdb_ci', '5a8d6816a1cf38003a42245d1035d56e', 'Desktop Services');
									snafuFlash('cmdb_ci');
								}
							}

							// reminders
							if (type === 'autoClose' && snafuReminderTickets.indexOf(ticketType) !== -1) {
								// action performed is depends on reminder
								switch (inject.detail.remind) {
									
									// open computer database tab
									case 'open':
										// save, update, auto, none
										snafuEndTicketInteraction(inject.detail.autoFinish, inject.detail.finishDelay, ticket.field, ticketAction.value);

										// attempt to get the root cause's sys_id
										var rootCause = snafuGetRootCauseSysId(ticketType);

										// open a tab using a custom javascript event
										query = document.createEvent('CustomEvent');
										query.initCustomEvent('SNAFU_OpenTab', true, true, {
											url: (rootCause !== false) ? snafuSprintf('https://ghsprod.service-now.com/cmdb_ci_computer.do?sys_id=%s', [rootCause]) : 'https://ghsprod.service-now.com/cmdb_ci_computer_list.do'
										});
										document.dispatchEvent(query);
										break;

									// popup using sweet alerts
									case 'popup':
										alert('Don\'t forget to update the device\'s location information.');
										
										// save, update, auto, none
										snafuEndTicketInteraction(inject.detail.autoFinish, inject.detail.finishDelay, ticket.field, ticketAction.value);
										break;

									// no reminder
									case 'none':
									default:
										// save, update, auto, none
										snafuEndTicketInteraction(inject.detail.autoFinish, inject.detail.finishDelay, ticket.field, ticketAction.value);
										break;
								}
							} else {
								snafuEndTicketInteraction(inject.detail.autoFinish, inject.detail.finishDelay, ticket.field, ticketAction.value);
							}

							// print labels
							if ((type === 'autoClose' && (ticketType === 'rhs_reclaim' || ticketType === 'rhs_reimage')) || (type === 'autoAcknowledge' && (ticketType === 'rhs_build' || ticketType === 'rhs_reimage'))) {
								// determine the label type from the ticket type
								labelType = snafuGetLabelType(type, ticketType);

								// make sure we do want to print these labels
								if (labelSettings[labelType] === true) {
									// make sure we have a valid printer
									if (snafuHasValidPrinter()) {
										snafuPrintLabel(ticketType, labelType);
									} else {
										console.warn('SNAFU: No appropriate printers were found.  Skipping print job. . .');
										snafuErrorMessage('No appropriate printers were found.  Skipping print job. . .');
									}
								}
							}
						}
					}				
				} else {
					snafuErrorMessage('Unknown ticket type detected.');
				}
				break;

			/**
			 * default behavior
			 */
			default:
				// make sure ticket is assigned
				if (snafuIsResolveCode(inject.detail.field, inject.detail.value) === true && g_form.getReference('assigned_to').currentRow === -1) {
					snafuErrorMessage('Unable to send update to unassigned ticket.  Please assign it to yourself and try again.');
				} else {
					var field = inject.detail.field;
					var value = inject.detail.value;
					var workNotes = (!snafuIsVarEmpty(inject.detail.workNotes)) ? snafuReplaceWildcards(inject.detail.workNotes) : null;
					var custNotes = (!snafuIsVarEmpty(inject.detail.custNotes)) ? snafuReplaceWildcards(inject.detail.custNotes) : null;

					if (type.indexOf('closeQuarantine') !== -1 && ticketType !== 'rhs_restock') {
						snafuErrorMessage('Open ticket is not for a quarantined asset');
					} else if (type.indexOf('closeHotSwap') !== -1 && ticketType !== 'rhs_build') {
						snafuErrorMessage('Open ticket is not for a Hot Swap build.');
					} else {

						// set field with value
						if (!snafuIsVarEmpty(field) && !snafuIsVarEmpty(value)) {
							snafuSetValue(field, value);
							snafuFlash(field)
						}

						// customer notes (comments)
						if (!snafuIsVarEmpty(custNotes)) {
							snafuSetValue('comments', custNotes);
							snafuFlash('comments');
						}

						// work notes
						if (!snafuIsVarEmpty(workNotes)) {
							snafuSetValue('work_notes', workNotes);
							snafuFlash('work_notes');
						}

						// set the resolve message if it is a resolved code (incident only)
						if (field === 'incident_state' && value === '6') {
							// set to Problem Resolved
							snafuSetValue('close_code', 'Problem Resolved');
							snafuFlash('close_code');

							// spoke to customer
							snafuSetValue('u_customer_communication', 'Spoke to Customer');
							snafuFlash('u_customer_communication');

							// attempt to set the resolve types based on information in the ticket
							var resolveTypes = snafuGetResolveType(g_form.getReference('cmdb_ci').name);
							if (resolveTypes !== false) {
								snafuSetValue('u_dell_resolve_1', resolveTypes.type_1);

								// set the second one 500ms after the first to allow it to populate
								setTimeout(function() { snafuSetValue('u_dell_resolve_2', resolveTypes.type_2) }, 500);	
							}

							if (!snafuIsVarEmpty(workNotes)) {
								snafuSetValue('close_notes', workNotes);
								snafuFlash('close_notes');
							} else if (!snafuIsVarEmpty(custNotes)) {
								snafuSetValue('close_notes', custNotes);
								snafuFlash('close_notes');
							}

						// change the root cause ci and due date for tasks
						} else if (field === 'state') {
							var dueDate = snafuGetDueDate();

							// due date
							if (g_form.getValue('due_date') !== dueDate) {
								snafuSetValue('due_date', dueDate);
								snafuFlash('due_date');
							}

							// root cause ci
							// desktop services value is 5a8d6816a1cf38003a42245d1035d56e
							if (g_form.getValue('cmdb_ci') !== '5a8d6816a1cf38003a42245d1035d56e') {
								snafuSetDisplayValue('cmdb_ci', '5a8d6816a1cf38003a42245d1035d56e', 'Desktop Services');
								snafuFlash('cmdb_ci');
							}

							// if setting to pending and sub-status is set, then set the select
							if (value === '-5' && !snafuIsVarEmpty(inject.detail.subStatus)) {
								snafuSetValue('u_sub_state', inject.detail.subStatus);
								snafuFlash('u_sub_state');
							}

							// set quarantine select, if needed
							if (type.indexOf('closeQuarantine') !== -1) {
								if (type !== 'closeQuarantineRepairYes' && type !== 'closeQuarantineRepairNo') {
									snafuSetValue('rhs_restock_status', type.replace('closeQuarantine', '').toLowerCase());
								} else {
									snafuSetValue('rhs_restock_status', 'repair');
									snafuSetValue('asset_repair_type', type.replace('closeQuarantineRepair', ''));
								}
							} else if (type.indexOf('closeHotSwap') !== -1) {
								snafuSetValue('rhs_replacement_type', type.replace('closeHotSwap', '').toLowerCase());
							} else if (type.indexOf('closeRepair') !== -1) {
								snafuSetValue('rhs_repair_type', type.replace('closeRepair', '').toLowerCase());
							}

							// if build logging is enabled and closing a hot swap, then log the build
							if (inject.detail.buildLog === true && ticketType === 'rhs_build' && (type.indexOf('closeHotSwap') !== -1 || snafuIsResolveCode(field, value) === true)) {
								// query the user info sent by the options page
								var buildLogQuery = document.createEvent('CustomEvent');
								var replacement = g_form.getReference('rhs_replacement_computer');
								var requestItem = g_form.getReference('request_item');
								buildLogQuery.initCustomEvent('SNAFU_BuildLogQuery', true, true, {
									sysId: requestItem.sys_id,
									ritm: requestItem.number,
									hostname: replacement.name,
									assetTag: replacement.asset_tag,
									dateTime: Date.now(),
									build: g_form.getValue('rhs_software'),
									model: snafuGetComputerModel(replacement.model_id),
									newUsed: type.replace('closeHotSwap', '').toLowerCase()
								});
								snafuInfoMessage('Build saved to the log.');
								document.dispatchEvent(buildLogQuery);

							// decommssion and repair log
							} else if (snafuIsResolveCode(field, value) === true && ((inject.detail.decomLog == true && ticketType === 'rhs_decommission') || (inject.detail.repairLog === true && ticketType === 'rhs_repair'))) {
								var logQuery = document.createEvent('CustomEvent');
								var brokenAsset = g_form.getReference('rhs_comp_name');
								var requestItem = g_form.getReference('request_item');
								logQuery.initCustomEvent('SNAFU_LogQuery', true, true, {
									logType: (ticketType === 'rhs_decommission') ? 'decoms' : 'repairs',
									sysId: requestItem.sys_id,
									ritm: requestItem.number,
									hostname: brokenAsset.name,
									assetTag: brokenAsset.asset_tag,
									dateTime: Date.now(),
									model: snafuGetComputerModel(brokenAsset.model_id)
								});
								snafuInfoMessage(snafuSprintf('Added to the %s log.', [(ticketType === 'rhs_decommission') ? 'decommission' : 'repair']));
								document.dispatchEvent(logQuery);
							}
						}
						
						// reminders
						if (snafuIsResolveCode(field, value) === true && snafuReminderTickets.indexOf(ticketType) !== -1) {
							// action performed is depends on reminder
							switch (inject.detail.remind) {
								
								// open computer database tab
								case 'open':
									// save, update, auto, none
									snafuEndTicketInteraction(inject.detail.autoFinish, inject.detail.finishDelay, field, value);

									// attempt to get the root cause's sys_id
									var rootCause = snafuGetRootCauseSysId(ticketType);

									// open a tab using a custom javascript event
									query = document.createEvent('CustomEvent');
									query.initCustomEvent('SNAFU_OpenTab', true, true, {
										url: (rootCause !== false) ? snafuSprintf('https://ghsprod.service-now.com/cmdb_ci_computer.do?sys_id=%s', [rootCause]) : 'https://ghsprod.service-now.com/cmdb_ci_computer_list.do'
									});
									document.dispatchEvent(query);
									break;

								// popup
								case 'popup':
									alert('Don\'t forget to update the device\'s location information.');

									// save, update, auto, none
									snafuEndTicketInteraction(inject.detail.autoFinish, inject.detail.finishDelay, field, value);
									break;

								// no reminder
								case 'none':
								default:
									// save, update, auto, none
									snafuEndTicketInteraction(inject.detail.autoFinish, inject.detail.finishDelay, field, value);
									break;
							}
						} else {
							snafuEndTicketInteraction(inject.detail.autoFinish, inject.detail.finishDelay, field, value);
						}

						// print labels
						if (type === 'sendEquipment' || type.indexOf('closeQuarantine') !== -1 || type.indexOf('closeHotSwap') !== -1 || type.indexOf('closeRepair') !== -1) {
							// determine the label type from the ticket type
							if (type === 'sendEquipment') {
								labelType = 'equipment';
							} else if (type.indexOf('closeRepair') !== -1) {
								labelType = (type.indexOf('OnSite') !== -1) ? 'restock' : 'decommission';
							} else {
								labelType = (type.indexOf('closeHotSwap') !== -1) ? 'build' : type.replace('closeQuarantine', '').replace('Yes', '').replace('No', '').toLowerCase();
							}

							// make sure we automatically print this label type
							if (labelSettings[labelType] === true) {
								// make sure we have a valid printer
								if (snafuHasValidPrinter()) {
									snafuPrintLabel(ticketType, labelType);
								} else {
									console.warn('SNAFU: No appropriate printers were found.  Skipping print job. . .');
									snafuErrorMessage('No appropriate printers were found.  Skipping print job. . .');
								}
							}
						}
					}
				}
				break;
			
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
	const wildcards = {
		// global
		"{ASSIGN_GROUP}": "(snafuIsVarEmpty(g_form.getReference('assignment_group')) === false) ? g_form.getReference('assignment_group').name : 'UNKNOWN';",
		"{OPENED}": "(snafuIsVarEmpty(g_form.getValue('opened_at')) === false) ? g_form.getValue('opened_at') : 'UNKNOWN';",
		"{OPENED_BY}": "(snafuIsVarEmpty(g_form.getValue('opened_by_label')) === false) ? g_form.getValue('opened_by_label') : 'UNKNOWN';",
		"{ROOT_CAUSE}": "(snafuIsVarEmpty(g_form.getReference('cmdb_ci')) === false) ? g_form.getReference('cmdb_ci').name : 'UNKNOWN';",
		"{TECH_NAME}": "(snafuIsVarEmpty(g_form.getReference('assigned_to')) === false) ? snafuUcwords(g_form.getReference('assigned_to').name) : 'UNKNOWN';",
		"{TICKET}": "(snafuIsVarEmpty(g_form.getValue('number')) === false) ? g_form.getValue('number') : 'UNKNOWN';",
		
		//incident only
		"{INC_ADDR}": "(snafuIsVarEmpty(g_form.getReference('u_street_address')) === false) ? snafuUcwords(g_form.getReference('u_street_address').u_name) : 'UNKNOWN';",
		"{INC_ADD_LOC}": "(snafuIsVarEmpty(g_form.getValue('u_location_description')) === false) ? g_form.getValue('u_location_description') : 'UNKNOWN';",
		"{INC_ALT_PHONE}": "(snafuIsVarEmpty(g_form.getValue('u_alternate_phone')) === false) ? g_form.getValue('u_alternate_phone') : 'UNKNOWN';",
		"{INC_CAMPUS}": "(snafuIsVarEmpty(g_form.getValue('u_campus')) === false) ? g_form.getValue('u_campus') : 'UNKNOWN';",
		"{INC_CUR_PHONE}": "(snafuIsVarEmpty(g_form.getValue('u_current_phone')) === false) ? g_form.getValue('u_current_phone') : 'UNKNOWN';",
		"{INC_CUSTOMER}": "(snafuIsVarEmpty(g_form.getReference('caller_id')) === false) ? snafuUcwords(g_form.getReference('caller_id').name) : 'UNKNOWN';",
		"{INC_CUST_FNAME}": "(snafuIsVarEmpty(g_form.getReference('caller_id')) === false) ? snafuUcwords(g_form.getReference('caller_id').first_name) : 'UNKNOWN';",
		"{INC_CUST_LNAME}": "(snafuIsVarEmpty(g_form.getReference('caller_id')) === false) ? snafuUcwords(g_form.getReference('caller_id').last_name) : 'UNKNOWN';",
		"{INC_DETAIL_DESC}": "(snafuIsVarEmpty(g_form.getValue('description')) === false) ? g_form.getValue('description') : 'UNKNOWN';",
		"{INC_EMAIL}": "(snafuIsVarEmpty(g_form.getReference('caller_id')) === false) ? g_form.getReference('caller_id').email.toLowerCase() : 'UNKNOWN';",
		"{INC_IMPACT}": "(snafuIsVarEmpty(g_form.getValue('impact')) === false) ? g_form.getValue('impact') : 'UNKNOWN';",
		"{INC_KB}": "(snafuIsVarEmpty(g_form.getReference('u_kb_article')) === false) ? g_form.getReference('u_kb_article').number : 'UNKNOWN';",
		"{INC_LOC_TYPE}": "(snafuIsVarEmpty(g_form.getValue('u_location_type')) === false) ? g_form.getValue('u_location_type') : 'UNKNOWN';",
		"{INC_PRACTICE}": "(snafuIsVarEmpty(g_form.getReference('u_practice_name')) === false) ? snafuUcwords(g_form.getReference('u_practice_name').name) : 'UNKNOWN';",
		"{INC_PRIORITY}": "(snafuIsVarEmpty(g_form.getValue('priority')) === false) ? g_form.getValue('priority') : 'UNKNOWN';",
		"{INC_SHORT_DESC}": "(snafuIsVarEmpty(g_form.getValue('short_description')) === false) ? g_form.getValue('short_description') : 'UNKNOWN';",
		"{INC_STATE}": "(snafuIsVarEmpty(g_form.getDisplayValue('incident_state')) === false) ? g_form.getDisplayValue('incident_state') : 'UNKNOWN';",
		"{INC_TYPE}": "(snafuIsVarEmpty(g_form.getValue('u_incident_type')) === false) ? g_form.getValue('u_incident_type') : 'UNKNOWN';",
		"{INC_TYPE_2}": "(snafuIsVarEmpty(g_form.getValue('u_incident_type_2')) === false) ? g_form.getValue('u_incident_type_2') : 'UNKNOWN';",
		"{INC_TYPE_3}": "(snafuIsVarEmpty(g_form.getValue('u_incident_type_3')) === false) ? g_form.getValue('u_incident_type_3') : 'UNKNOWN';",
		"{INC_URGENCY}": "(snafuIsVarEmpty(g_form.getValue('urgency')) === false) ? g_form.getValue('urgency') : 'UNKNOWN';",
		
		// task only	
		"{CATEGORY_ITEM}": "(snafuIsVarEmpty(g_form.getValue('cat_item')) === false) ? g_form.getValue('cat_item') : 'UNKNOWN';",
		"{DUE_DATE}": "(snafuIsVarEmpty(g_form.getValue('due_date')) === false) ? g_form.getValue('due_date') : 'UNKNOWN';",
		"{REQUEST_ITEM}": "(snafuIsVarEmpty(g_form.getReference('request_item')) === false) ? g_form.getReference('request_item').number : 'UNKNOWN';",
		"{REQUESTED_BY}": "(snafuIsVarEmpty(g_form.getReference('request_item.request.requested_for')) === false) ? snafuUcwords(g_form.getReference('request_item.request.requested_for').name) : 'UNKNOWN';",
		"{REQUESTED_FOR}": "(snafuIsVarEmpty(g_form.getReference('request_item.u_requested_for')) === false) ? snafuUcwords(g_form.getReference('request_item.u_requested_for').name) : 'UNKNOWN';",
		"{REQUESTED_FOR_CAMPUS}": "(snafuIsVarEmpty(g_form.getValue('requestedfor_campus')) === false) ? snafuGetCampusName(g_form.getValue('requestedfor_campus')) : 'UNKNOWN';",
		"{TASK_STATE}": "(snafuIsVarEmpty(g_form.getDisplayValue('state')) === false) ? g_form.getDisplayValue('state') : 'UNKNOWN';",
		
		// hot swap only
		"{BROKEN_ASSET}": "(snafuIsVarEmpty(g_form.getReference('rhs_comp_name')) === false) ? g_form.getReference('rhs_comp_name').asset_tag : 'UNKNOWN';",
		"{BROKEN_HOSTNAME}": "(snafuIsVarEmpty(g_form.getReference('rhs_comp_name')) === false) ? g_form.getReference('rhs_comp_name').name : 'UNKNOWN';",
		"{BROKEN_MODEL}": "(snafuIsVarEmpty(g_form.getReference('rhs_comp_name')) === false) ? snafuGetComputerModel(g_form.getReference('rhs_comp_name').model_id) : 'UNKNOWN';",
		"{BROKEN_SERIAL}": "(snafuIsVarEmpty(g_form.getReference('rhs_comp_name')) === false) ? g_form.getReference('rhs_comp_name').serial_number : 'UNKNOWN';",
		"{RELATED_INC}": "(snafuIsVarEmpty(g_form.getReference('rhs_inc')) === false) ? g_form.getReference('rhs_inc').number : 'UNKNOWN';",
		"{REPLACE_ASSET}": "(snafuIsVarEmpty(g_form.getReference('rhs_replacement_computer')) === false) ? g_form.getReference('rhs_replacement_computer').asset_tag : 'UNKNOWN';",
		"{REPLACE_BUILD}": "(snafuIsVarEmpty(g_form.getValue('rhs_software')) === false) ? g_form.getValue('rhs_software').replace(\/(?:\\r\\n|\\r|\\n)\/g, ', ') : 'UNKNOWN';",
		"{REPLACE_CUSTOMER}": "(snafuIsVarEmpty(g_form.getReference('rhs_user')) === false) ? snafuUcwords(g_form.getReference('rhs_user').name) : 'UNKNOWN';",
		"{REPLACE_HOSTNAME}": "(snafuIsVarEmpty(g_form.getReference('rhs_replacement_computer')) === false) ? g_form.getReference('rhs_replacement_computer').name : 'UNKNOWN';",
		"{REPLACE_MODEL}": "(snafuIsVarEmpty(g_form.getReference('rhs_replacement_computer')) === false) ? snafuGetComputerModel(g_form.getReference('rhs_replacement_computer').model_id) : 'UNKNOWN';",
		"{REPLACE_SERIAL}": "(snafuIsVarEmpty(g_form.rhs_replacement_computer('serial_number')) === false) ? g_form.rhs_replacement_computer('serial_number') : 'UNKNOWN';",
		
		// miscellaneous
		"{ABS_MACHINE}": "(snafuIsVarEmpty(g_form.getReference('cmdb_ci')) === false) ? g_form.getReference('cmdb_ci').name : 'UNKNOWN';",
		"{LABEL_TECH}": "(snafuIsVarEmpty(g_form.getReference('request_item.request.requested_for')) === false) ? snafuSprintf('%s %s.', [snafuUcwords(g_form.getReference('request_item.request.requested_for').first_name), g_form.getReference('request_item.request.requested_for').last_name.charAt(0).toUpperCase()]) : 'UNKNOWN';",										
		"{LABEL_INC_TECH}": "(snafuIsVarEmpty(g_form.getReference('assigned_to')) === false) ? snafuSprintf('%s %s.', [snafuUcwords(g_form.getReference('assigned_to').first_name), g_form.getReference('assigned_to').last_name.charAt(0).toUpperCase()]) : 'UNKNOWN';",
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
 * Javascript snafuSprintf function.
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
 * Shortens strings destined for label printing.
 * @param	{String}	str
 * @return	{String}
 */
function snafuShortenLabelString(str) {
	return (str.length > 35) ? str.substr(0, 34) + '...' : str;
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
 * Service Now input field snafuFlash.
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
	if (snafuIsVarEmpty(g_form) === false) {
		g_form.addInfoMessage(snafuSprintf('SNAFU: %s', [msg]));
	} else {
		console.info(msg);
	}
}

/**
 * Sends Service Now error message.
 * @param	{String}	msg
 * @return	{Void}
 */
function snafuErrorMessage(msg) {
	if (snafuIsVarEmpty(g_form) === false) {
		g_form.addErrorMessage(snafuSprintf('SNAFU Error: %s', [msg]));
	} else {
		console.error(msg);
	}
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
		var shortDesc = g_form.getValue('short_description');
		if (shortDesc.indexOf('Equipment Move/Remove') !== -1) {
			return 'equip_removal';
		} else if (shortDesc.indexOf('Disconnect System') !== -1) {
			return 'equip_disconnect';
		} else if (shortDesc.indexOf('Reconnect System') !== -1) {
			return 'equip_reconnect';
		} else if (shortDesc.indexOf('CANCELLED TASK') !== -1) {
			return 'cancelled_task';
		} else if (shortDesc.indexOf('Smart/Remote Hands Request') !== -1) {
			return 'smart_hands';
		} else {
        	var taskName = g_form.getValue('u_task_name').toLowerCase();
			return (taskName in snafuAutoTickets) ? taskName : 'generic_task';
		}
	} else if (document.getElementById('u_absolute_install.state') !== null) {
		return 'absolute_install';
    } else {
        // it's neither
        return false;
    }
}

/**
 * Returns the ticket action, based on the ticket type.
 * @param	{String}	type
 * @return	{Object}
 */
function snafuGetTicketAction(type) {
	var actions = {
		'autoAcknowledge': function() { return 'ack'; },
		'autoClose': function() { return 'close'; },
		'autoEnRoute': function() { return 'enRoute'; },
		'autoPending': function() { return 'pending'; },
	}
	return actions[type]();
}

/**
 * Attempt to pull the sys_id of a desktop/laptop (or return false)
 * @param	{String}	ticket
 * @return	{String|Boolean}
 */
function snafuGetRootCauseSysId(ticket) {
	switch (ticket) {

		// incident's will come from the root cause ci
		case 'generic_incident':
			var rootCause = g_form.getReference('cmdb_ci');
			return (rootCause.name.substr(0, 2).toLowerCase() === 'lt' || rootCause.name.substr(0,2).toLowerCase() === 'dt' || rootCause.name.substr(0, 2).toLowerCase() === 'tb') ? rootCause.sys_id : false;
			break;

		// asset management workflow uses the broken device's hostname
		case 'rhs_reimage_return':
		case 'rhs_build':
		case 'rhs_reclaim':
		case 'rhs_restock':
		case 'rhs_repair':
		case 'rhs_decommission':
			return g_form.getReference('rhs_comp_name').sys_id || false;
			break;

		default: 
			return false;
			break;
	}
}

/**
 * Save or updates (or does nothing) to the ticket at the end.
 * @param	{String}	action
 * @param	{Int}		delay
 * @param	{String}	field
 * @param	{String}	value
 * @return	{Void}
 */
function snafuEndTicketInteraction(action, delay, field, value) {
	// autofinish
	switch (action) {
		// save (stay on ticket's page)
		case 'save':
			// not going to let incidents be autosaved
			if (field === 'state' || (field === 'incident_state' && value !== '6')) {
				// delay 1.5 seconds
				setTimeout(function() { g_form.save(); }, delay * 1000);
			}
			break;
		
		// update (go back to last page)
		case 'update':
			// not going to let incident be autoupdated
			if (field === 'state' || (field === 'incident_state' && value !== '6')) {
				// delay 1.5 seconds
				setTimeout(function() { g_form.submit(); }, delay * 1000);
			}
			break;

		// auto (save all updates except closures, which are updated. incidents are never automatically resolved)
		case 'auto':
			// if a closure then update, otherwise save
			if (field === 'state' && (value === '3' || value === '4')) {
				// update
				setTimeout(function() { g_form.submit(); }, delay * 1000);
			} else if (field === 'state' || (field === 'incident_state' && value !== '6')) {
				setTimeout(function() { g_form.save(); }, delay * 1000);
			}
			break;
		
		// neither
		case 'none':
		default:
			break;
	}
}

/**
 * Determines if the status provided is a resolve code.
 * @param	{String}	field
 * @param	{String}	value
 * @return	{Boolean}
 */
function snafuIsResolveCode(field, value) {
	switch (field) {
		case 'incident_state':
			return (value === '6') ? true : false;
			break;
		case 'state':
			return (value === '3') ? true : false;
			break;
		default:
			return false;
			break;
	}
}

/**
 * Attempts to determine the resolve types.
 * @param	{String}	cmdb
 * @return	{String|Boolean}
 */
function snafuGetResolveType(cmdb) {
	var firstTwo = cmdb.substr(0, 2).toUpperCase();
	// dt, lt, or tb
	if (firstTwo in snafuResolveTypes) {
		return snafuResolveTypes[firstTwo];	
	} else {
		for (var keyword in snafuResolveTypes) {
			if (keyword !== 'DT' && keyword !== 'LT' && keyword !== 'TB') {
				if (cmdb.toLowerCase().indexOf(keyword) !== -1) {
					return snafuResolveTypes[keyword];
				}
			}
		}
		return false;
	}
}

/**
 * Determines if valid Dymo printers are connected.
 * @return	{Boolean}
 */
function snafuHasValidPrinter() {
	var printers = dymo.label.framework.getPrinters().filter(function(printer) { return (printer.isConnected === true && printer.isLocal === true) });
	return (printers.length > 0) ? true : false
}

/**
 * Prints a Dymo label.
 * @param	{String}	ticketType
 * @param	{String}	labelType
 */
function snafuPrintLabel(ticketType, labelType) {
	// get the printer's name as well for printing
	var printers = dymo.label.framework.getPrinters().filter(function(printer) { return (printer.isConnected === true && printer.isLocal === true) });
	var printerName = printers[0]['name'];

	if (!snafuIsVarEmpty(printerName)) {
		var labelFields = snafuLabelFields[labelType];
		if (labelFields === undefined) {
			console.warn('SNAFU: Dymo label type returned invalid.  Skipping print job. . .');
			snafuErrorMessage('Dymo label type returned invalid.  Skipping print job. . .');
		} else if (labelFields['ticketType'] !== true && labelFields['ticketType'].indexOf(ticketType) === -1) {
			console.warn(snafuSprintf('SNAFU: You can\'t print label type "%s" on ticket type "%s".', [labelType, ticketType]));
			snafuErrorMessage(snafuSprintf('You can\'t print label type "%s" on ticket type "%s".', [labelType, ticketType]));
		} else {
			var addressLabel = dymo.label.framework.openLabelXml(snafuGetDymoLabelXml(labelType));
			var reason = '';
			var canPrint = true;
			for (var field in labelFields) {
				if (field !== 'ticketType') {
					// reclaim and repair labels
					if ((labelType === 'reclaim' || labelType === 'repair') && field === 'TEXT_5') {
						reason = prompt(snafuSprintf('Enter the reason for %s this device.  KEEP IT SHORT!', (labelType === 'reclaim') ? ['reclaiming'] : ['repairing']));
						if (snafuIsVarEmpty(reason) === true) {
							console.warn('SNAFU: You must provide a valid reason.');
							snafuErrorMessage('You must provide a valid reason.  Skipping print job. . .');
							canPrint = false;
							break;
						} else {
							addressLabel.setObjectText(field, snafuShortenLabelString(reason));
							reason = '';
						}

					// broken equipment labels
					} else if (labelType === 'broken' && field === 'EQUIP') {
						reason = prompt('What equipment is broken?  KEEP IT SHORT!');
						if (snafuIsVarEmpty(reason) === true) {
							console.warn('SNAFU: You must provide a valid reason.');
							snafuErrorMessage('You must provide a valid reason.  Skipping print job. . .');
							canPrint = false;
							break;
						} else {
							addressLabel.setObjectText(field, snafuShortenLabelString(reason));
							reason = '';
						}

					// hot swap build labels
					} else if (
						(labelType === 'build' || labelType === 'reimage') && 
						(field === 'TEXT_4' || field === 'TEXT_8')
					) {
						if (field === 'TEXT_4') {
							addressLabel.setObjectText(field, g_form.getValue('rhs_software').split('\n')[0]);
						} else {
							var buildInput = g_form.getValue('rhs_software');
							if (buildInput.indexOf('\n') !== -1) {
								addressLabel.setObjectText(field, snafuShortenLabelString(buildInput.split('\n')[1]));
							} else {
								addressLabel.setObjectText(field, 'Standard software load.');
							}
						}
					
					// build ack labels
					} else if (
						(labelType === 'buildack' || labelType === 'reimageack') &&
						(field === 'BUILD' || field === 'APPS')
					) {
						if (field === 'BUILD') {
							addressLabel.setObjectText(field, g_form.getValue('rhs_software').split('\n')[0]);
						} else {
							var buildInput = g_form.getValue('rhs_software');
							if (buildInput.indexOf('\n') !== -1) {
								addressLabel.setObjectText(field, snafuShortenLabelString(buildInput.split('\n')[1]));
							} else {
								addressLabel.setObjectText(field, 'Standard software load.');
							}
						}

					// purchase order labels
					} else if (labelType === 'purchase' && (field === 'PO' || field === 'MORE_PO')) {
						reason = prompt('Enter up to three PO numbers. Separate them by commas with no spaces. Each one will be put on the new line.');
						if (!snafuIsVarEmpty(reason)) addressLabel.setObjectText(field, (reason.indexOf(',') !== -1) ? reason.replace(/,/g, '\r\n') : reason);

					// equipment configuration labels
					} else if (labelType === 'equipment' && (field === 'HOSTNAME_TEXT' || field === 'TEXT_8' || field === 'TEXT_4')) {
						addressLabel.setObjectText(field, snafuShortenLabelString(inject.detail.equipLabel[field]));

					// prebuilt device label
					} else if (labelType === 'prebuilt') {
						if (field === 'BUILD_TYPE') {
							reason = prompt('What is the build type (GrMH-MANDATORY, etc.) of the prebuilt device?');
						} else if (field === 'HOSTNAME') {
							reason = prompt('What is the device\'s hostname?');
						} else {
							reason = prompt('What is the device\'s asset tag?');
						}

						if (snafuIsVarEmpty(reason) === true) {
							console.warn('SNAFU: You must provide valid input.');
							snafuErrorMessage('You must provide valid input.  Skipping print job. . .');
							canPrint = false;
						} else {
							addressLabel.setObjectText(field, snafuShortenLabelString(reason.toUpperCase()));
							reason = ''; // reset it for the next field
						}
					// "the rest"
					} else {
						addressLabel.setObjectText(field, snafuShortenLabelString(snafuReplaceWildcards(labelFields[field])));
					}
				}
			}

			if (!canPrint) {
				console.warn('SNAFU: Unable to print label due to errors.');
			} else {
				addressLabel.print(printerName);
			}
		}
	} else {
		console.warn('SNAFU: Unable to determine printer name.  Skipping print job. . .');
		snafuErrorMessage('Unable to determine printer name.  Skipping print job. . .');
	}
}

/**
 * Determines campus from ID.
 * @param	{String}	uid
 * @return	{String}
 */
function snafuGetCampusName(uid) {
	switch (uid) {
		case '6480562a9861f1003a423fba5511147d':
			return 'Baptist Easley';
			break;
		case '3fcd08d12b9af90033bdff70f8da15e8':
			return 'GHS Downtown';
			break;
		case 'd4e0962a9861f1003a423fba5511147f':	// ngh
		case 'd690522a9861f1003a423fba551114d9':	// gmmc
			return 'ISC';
			break;
		case '52c0962a9861f1003a423fba5511147d':
			return 'GrMH';
			break;
		case '15d0962a9861f1003a423fba5511147e':
			return 'LCMH';
			break;
		case '102861af6f1b220049bfd4a21c3ee499':
			return 'MDC';
			break;
		case 'bfe0962a9861f1003a423fba551114b8':
			return 'OMH';
			break;
		case '6c11562a9861f1003a423fba551114de':
			return 'Offsite';
			break;
		case '9b9265f92b121240fb4c779217da1568':
			return 'Self Regional Hospital';
			break;
		case '9901562a9861f1003a423fba551114dd':
			return 'HMH';
			break;
		case '3f9609fe2bbc0a0033bdff70f8da159f':	// independence pointe
		case '72f0962a9861f1003a423fba551114ba':	// patewood
			return 'Patewood';
			break;
		default:
			return 'Unknown';
	}
}

/**
 * Get Dymo Label Type
 * @param	{String}	type
 * @param	{String}	ticket
 * @return	{String}
 */
function snafuGetLabelType(type, ticket) {
	if (type === 'autoAcknowledge') {
		return (ticket === 'rhs_build') ? 'buildack' : 'reimageack';
	} else {
		return (ticket === 'rhs_reclaim') ? 'reclaim' : 'reimage';
	}
}

/**
 * Get Dymo label XML.
 * @param	{String}	type
 * @return	{String}
 */
function snafuGetDymoLabelXml(type) {
	// dymo label xml
	switch (type) {

		// broken equipment label
		case 'broken':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><IsOutlined>false</IsOutlined><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><DateTimeObject><Name>DATE-TIME</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>DayAbbrMonthLongYear</DateTimeFormat><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText /><PostText /><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="2973" Y="57.9999999999999" Width="1980" Height="330" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Broken Equipment</String><Attributes><Font Family="Arial" Size="14" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="57.9999999999999" Width="2282" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>TICKET</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Bottom</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">INCXXXXXXX</String><Attributes><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1208" Width="1995" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>EQUIP</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Broken Equipment</String><Attributes><Font Family="Arial" Size="16" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="390" Width="4622" Height="720" /></ObjectInfo><ObjectInfo><TextObject><Name>TECH</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Bottom</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Adam K.</String><Attributes><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="2823" Y="1208" Width="2130" Height="285" /></ObjectInfo></DieCutLabel>';
			break;

		// build, equipment, and reimage labels
		case 'build':
		case 'reimage':
		case 'equipment':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><IsOutlined>false</IsOutlined><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Host Name:</String><Attributes><Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="472.311157226563" Width="1350" Height="360" /></ObjectInfo><ObjectInfo><TextObject><Name>HOSTNAME_TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">DTXXXXXXXXXX</String><Attributes><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1727.69787597656" Y="480.576568603516" Width="3099.9208984375" Height="345" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>DATE-TIME</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText>Date Built: </PreText><PostText /><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="843.150024414063" Width="3535.39453125" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_3</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Tech: Adam Koch</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="3513" Y="849.599975585938" Width="1440" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">W7, &lt;BUILD&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="2634.90649414063" Y="58" Width="2318.09350585938" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Apps:</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1064.25" Width="452" Height="210" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_6</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Customer:</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277" Width="827" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">RITMXXXXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="3105.6259765625" Y="242.37272644043" Width="1847.3740234375" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_2</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">&lt;CUSTOMER&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1248" Y="1268" Width="2880" Height="225" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_8</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Office, Skype</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="858" Y="1058" Width="2880" Height="210" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>HOSTNAME_TEXT</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><Text>DTXXXXXXXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="133" Width="3180" Height="285" /></ObjectInfo></DieCutLabel>';
			break;

		// build & reimage ack label
		case 'buildack':
		case 'reimageack':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><IsOutlined>false</IsOutlined><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>RITM</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">RITM0123456</String><Attributes><Font Family="Arial" Size="14" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="57.9999999999999" Width="2085" Height="345" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_1</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Tech:</String><Attributes><Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="345" Width="734.999999999999" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>BUILD</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Other-Mandatory</String><Attributes><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="2358" Y="57.9999999999999" Width="2595" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT__1</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Apps:</String><Attributes><Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="630" Width="734.999999999999" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT__2</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">EU:</String><Attributes><Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1208" Width="464.999999999999" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>TECH</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Adam K.</String><Attributes><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1143" Y="345" Width="1875" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>APPS</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Standard software load.</String><Attributes><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1143" Y="645" Width="3810" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT___1</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Model:</String><Attributes><Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="915" Width="854.999999999999" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>MODEL</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">800 G1 USDT</String><Attributes><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1143" Y="930" Width="3810" Height="285" /></ObjectInfo><ObjectInfo><TextObject><Name>ENDUSER</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Anya Decoteau</String><Attributes><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1143" Y="1208" Width="3810" Height="285" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>DATE-TIME</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>DayAbbrMonthYear</DateTimeFormat><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText /><PostText /><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="3228" Y="345" Width="1725" Height="285" /></ObjectInfo></DieCutLabel>';
			break;
		
		// decommission label
		case 'decommission':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;SerialNumber&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277.82592773438" Width="3055.73413085938" Height="187.199996948242" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>QuarantineDate</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText></PreText><PostText></PostText><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="648.052490234375" Width="4622" Height="221.363922119141" /></ObjectInfo><ObjectInfo><TextObject><Name>Tech</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Tech&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3163.158203125" Y="1277" Width="1789.84191894531" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>Decommission</String><Attributes><Font Family="Arial" Size="11" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="58" Width="4622" Height="242.819625854492" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Reason&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="967.651062011719" Width="4622" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>RITM0XXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3326.11669921875" Y="360" Width="1626.88342285156" Height="187.199996948242" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>RITM#</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><Text>RITM0XXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="322.519256591797" Width="3145.45361328125" Height="265.037841796875" /></ObjectInfo></DieCutLabel>';
			break;

		// po label
		case 'purchase':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>FileFolder</Id><IsOutlined>false</IsOutlined><PaperName>30327 File Folder - offset</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="806" Height="4950" Rx="180" Ry="180" /></DrawCommands><ObjectInfo><TextObject><Name>RITM</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">RITM0303184</String><Attributes><Font Family="Calibri" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="316.799987792969" Y="57.6000137329102" Width="1485" Height="301.200012207031" /></ObjectInfo><ObjectInfo><TextObject><Name>PO</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">707700-0-ISC</String><Attributes><Font Family="Calibri" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="3512.40008544922" Y="57.6000137329102" Width="1350" Height="691.200012207031" /></ObjectInfo><ObjectInfo><TextObject><Name>MORE_PO</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText /></TextObject><Bounds X="1967.40014648438" Y="57.6000137329102" Width="1350" Height="691.200012207031" /></ObjectInfo></DieCutLabel>';
			break;

		// prebuilt label
		case 'prebuilt':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><IsOutlined>false</IsOutlined><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>BUILD_TYPE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">&lt;BUILD&gt;</String><Attributes><Font Family="Arial" Size="14" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="57.9999999999999" Width="3212" Height="315" /></ObjectInfo><ObjectInfo><TextObject><Name>ASSET_TAG_LABEL</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>AlwaysFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Asset Tag:</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="990" Width="1155" Height="210" /></ObjectInfo><ObjectInfo><TextObject><Name>ASSET_TAG</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">GENERIC</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1683" Y="998.000000000001" Width="3270" Height="209.999999999999" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>ASSET_TAG_BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>ASSET_TAG</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><Text>GENERIC</Text><Type>Code39</Type><Size>Medium</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="466" Y="1268" Width="4487" Height="225" /></ObjectInfo><ObjectInfo><TextObject><Name>HOSTNAME_LABEL</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>AlwaysFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Hostname:</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="405" Width="1155" Height="210" /></ObjectInfo><ObjectInfo><TextObject><Name>HOSTNAME</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">GENERIC</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1683" Y="413.000000000001" Width="3270" Height="209.999999999999" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>HOSTNAME_BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>HOSTNAME</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><Text>GENERIC</Text><Type>Code39</Type><Size>Medium</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="466" Y="683" Width="4487" Height="225" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>DATE-TIME</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>ShortSystemDate</DateTimeFormat><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText /><PostText /><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="3633" Y="57.9999999999999" Width="1320" Height="270" /></ObjectInfo></DieCutLabel>';
			break;

		// reclaim label
		case 'reclaim':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;SerialNumber&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277.82592773438" Width="3055.73413085938" Height="187.199996948242" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>QuarantineDate</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText>Date Quarantined: </PreText><PostText></PostText><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="648.052490234375" Width="4622" Height="221.363922119141" /></ObjectInfo><ObjectInfo><TextObject><Name>Tech</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Tech&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3163.158203125" Y="1277" Width="1789.84191894531" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>Quarantine</String><Attributes><Font Family="Arial" Size="11" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="58" Width="4622" Height="242.819625854492" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Reason&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="967.651062011719" Width="4622" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>RITM0XXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3326.11669921875" Y="360" Width="1626.88342285156" Height="187.199996948242" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>RITM#</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><Text>RITM0XXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="322.519256591797" Width="3145.45361328125" Height="265.037841796875" /></ObjectInfo></DieCutLabel>';
			break;
		
		// repair label
		case 'repair':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;SerialNumber&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277.82592773438" Width="3055.73413085938" Height="187.199996948242" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>QuarantineDate</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText>Repair Started: </PreText><PostText></PostText><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="648.052490234375" Width="4622" Height="221.363922119141" /></ObjectInfo><ObjectInfo><TextObject><Name>Tech</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Tech&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3163.158203125" Y="1277" Width="1789.84191894531" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>Repair</String><Attributes><Font Family="Arial" Size="11" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="58" Width="4622" Height="242.819625854492" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Results&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="967.651062011719" Width="4622" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>RITM0XXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3326.11669921875" Y="360" Width="1626.88342285156" Height="187.199996948242" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>RITM#</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><Text>RITM0XXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="322.519256591797" Width="3145.45361328125" Height="265.037841796875" /></ObjectInfo></DieCutLabel>';
			break;

		// restock label
		case 'restock':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;SerialNumber&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277.82592773438" Width="3055.73413085938" Height="187.199996948242" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>QuarantineDate</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText>Restocked: </PreText><PostText></PostText><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="648.052490234375" Width="4622" Height="221.363922119141" /></ObjectInfo><ObjectInfo><TextObject><Name>Tech</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Tech&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3163.158203125" Y="1277" Width="1789.84191894531" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>Restock</String><Attributes><Font Family="Arial" Size="11" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="58" Width="4622" Height="242.819625854492" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Results&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="967.651062011719" Width="4622" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>RITM0XXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3326.11669921875" Y="360" Width="1626.88342285156" Height="187.199996948242" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>RITM#</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><Text>RITM0XXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="322.519256591797" Width="3145.45361328125" Height="265.037841796875" /></ObjectInfo></DieCutLabel>';
			break;
		
		default:
			return false;
			break;
	}
}