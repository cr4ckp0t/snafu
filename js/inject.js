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
const snafuRslvComments = "My name is {TECH_NAME} and I was the technician that assisted you with {TICKET}. Thank you for the opportunity to provide you with service today with your {INC_TYPE}. If for any reason, your issue does not appear to be resolved please contact the Service Desk at (864) 455-8000.";
const snafuAutoTickets = { 
	// misc
	'generic_task': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete task', 'value': '2' },
		'close': null
	},
	'generic_incident': {
		'field': 'incident_state',
		'ack': { 'script': 'Acknowledging incident.', 'value': '3' },
		'enRoute': { 'script': 'En route to troubleshoot the device.', 'value': '3' },
		'close': null
	},
	'general_request': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging general request task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete the general request.', 'value': '2' },
		'close': null
	},

	// equipment move/remove
	'equip_removal': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging equipment removal.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete equipment removal', 'value': '2' },
		'close': { 'script': 'Equipment removed, per {REQUESTED_BY}\'s request.', 'value': '3' }
	},
	'equip_disconnect': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging equipment disconnect task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete equipment disconnect.', 'value': '2' },
		'close': { 'script': 'Equipment disconnected, per {REQUESTED_BY}\'s request.', 'value': '3' }
	},
	'equip_reconnect': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging equipment reconnect task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete equipment reconnect.', 'value': '2' },
		'close': { 'script': 'Equipment reconnected and tested, per {REQUESTED_BY}\'s request.', 'value': '3' }
	},
	
	// reimage only workflow
	'rhs_reclaim_reimage':	{
		'field': 'state',
		'ack': { 'script': 'Acknowledging reclaim for device reimage.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete reimage reclaim.', 'value': '2' },
		'close': { 'script': 'Device has been reclaimed for reimaging.', 'value': '3' }
	},
	'rhs_reimage': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging reimage task.', 'value': '2' },
		'enRoute': null,
		'close': { 'script': 'Computer has been built. One {BROKEN_MODEL} has been built {REPLACE_BUILD}. Tag {BROKEN_ASSET} HostName {BROKEN_HOSTNAME}. Resolving Task.', 'value': '3' }
	},
	'rhs_reimage_return': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging reimage return task.', 'value': '2' },
		'enRoute': { 'script': 'En route to return {BROKEN_HOSTNAME}.', 'value': '2' },
		'close': { 'script': 'Device has been returned to the customer.', 'value': '3' }
	},

	// asset management workflow
	'rhs_build': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging build request.', 'value': '2' },
		'enRoute': null,
		'close': null
	},
	'rhs_reclaim': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging reclaim task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete {BROKEN_HOSTNAME} reclaim.', 'value': '2' },
		'close': { 'script': '{BROKEN_HOSTNAME} has been reclaimed and added to quarantine.', 'value': '3' }
	},
	'rhs_restock': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging quarantine task.', 'value': '2' },
		'enRoute': null,
		'close': null
	},
	'rhs_repair': {
		'field': 'state',
		'ack': {
			'script': 'Acknowledging repair task.',
			'value': '2'
		},
		'enRoute': null,
		'close': { 'script': '{BROKEN_HOSTNAME} has been repaired and returned to stock.', 'value': '3' }
	},
	'rhs_decommission': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging decommission task.', 'value': '2' },
		'enRoute': null,
		'close': { 'script': '{BROKEN_HOSTNAME} has been decommissioned.', 'value': '3' }
	},

	// mdc deliver workflow
	'1st_deliver_mdc': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging MDC Staging delivery task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete MDC Staging delivery.', 'value': '2' },
		'close': null
	},
	'deliver_mdc': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging MDC Disposal task.', 'value': '2' },
		'enRoute': null,
		'close': null
	},

	// purchase order workflow
	'po_configure_pc': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging equipment configuration task.', 'value': '2' },
		'enRoute': null,
		'close': null
	},
	'po_deploy_items': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging equipment delivery task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete equipment delivery.', 'value': '2' },
		'close': { 'script': 'Completed equipment delivery to staging at {REQUESTED_FOR_CAMPUS}.', 'value': '3' }
	},
	'po_install_items': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging equipment install task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete equipment installation.', 'value': '2' },
		'close': { 'script': 'Installed equipment and attached signed completion sheet.', 'value': '3' }
	},

	// spr workflow
	'spr_configure': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging SPR configuration task.', 'value': '2' },
		'enRoute': null,
		'close': null
	},
	'spr_delivery': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging SPR delivery task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete SPR delivery.', 'value': '2' },
		'close': { 'script': 'Completed SPR delivery.', 'value': '3' }
	},
	'spr_install': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging SPR install task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete SPR installation.', 'value': '2' },
		'close': { 'script': 'Completed SPR installation and attached signed completion sheet.', 'value': '3' }
	},

	// equipment pull workflow
	'equip_pull': {
		'field': 'state', 'ack': { 'script': 'Acknowledging equipment pull request.', 'value': '2' },
		'enRoute': null,
		'close': { 'script': 'Equipment pulled for delivery.', 'value': '3' }
	},

	// loaner workflow
	'loaner_build': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging loaner request build.', 'value': '2' },
		'enRoute': null,
		'close': null
	},
	'loaner_deploy': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging loaner deployment task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete loaner deployment.', 'value': '2' },
		'close': { 'script': 'Delivered requested loaner device(s) and attached signed loaner form.', 'value': '3' }
	},
	'loaner_reclaim': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging loaner reclaim task.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete loaner reclaim.', 'value': '2' },
		'close': { 'script': 'Loaner device reclaimed.', 'value': '3' }
	},

	// install absolute task
	'absolute_install': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging Absolute install request.', 'value': '2' },
		'enRoute': null,
		'close': { 'script': 'Absolute installation completed on {ABS_MACHINE}.', 'value': '3' }
	},
	
	// application install request
	'app_install': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging application install request.', 'value': '2' },
		'enRoute': { 'script': 'Installing requested application on the device.', 'value': '2' },
		'close': { 'script': 'Completed the requested software installation.', 'value': '3' }
	},

	// cancelled task (when closing workflow as incomplete)
	'cancelled_task': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging cancelled task workflow.', 'value': '2' },
		'enRoute': null,
		'close': { 'script': 'Updated {BROKEN_HOSTNAME}\'s location information.', 'value': '3' }
	},

	// smart hands request
	'smart_hands': {
		'field': 'state',
		'ack': { 'script': 'Acknowledging Smart Hands request.', 'value': '2' },
		'enRoute': { 'script': 'En route to complete the Smart Hands request.', 'value': '2' },
		'close': { 'script': 'Completed Smart Hands request.', 'value': '3' }
	}
}

// dymo label fields
const snafuLabelFields = {
	// replacement build
	'build': {
		'HOSTNAME_TEXT': '{REPLACE_HOSTNAME}',	// replacement build's hostname
		'TEXT_3': 'Tech: {TECH_NAME}',			// technician
		'TEXT_4': '{REPLACE_BUILD}',			// replacement os and build
		'RITM#': '{REQUEST_ITEM}',				// ritm number
		'TEXT_2': '{REPLACE_CUSTOMER}',			// customer
		'TEXT_8': 'Office, Skype, Citrix'		// software
	},

	// decommission
	'decommission': {
		'TEXT': '{BROKEN_SERIAL}',			// asset serial being decommissioned
		'Tech': '{LABEL_TECH}',				// technician
		'TEXT_5': 'Decommission asset.',	// reason
		'RITM#': '{REQUEST_ITEM}'			// ritm number
	},

	// reclaim task
	'reclaim': {
		'TEXT':	'{BROKEN_SERIAL}',		// reclaimed asset's serial number
		'Tech': '{LABEL_TECH}',			// technician
		'TEXT_5': '{RECLAIM_REASON}',	// reason for reclaiming
		'RITM#': '{REQUEST_ITEM}'		// ritm number
	},

	// repair task
	'repair': {
		'TEXT': '{BROKEN_SERIAL}',		// asset being repaired's serial number
		'Tech': '{LABEL_TECH}',			// technician
		'TEXT_5': '{REPAIR_REASON}',	// repair reason
		'RITM#': '{REQUEST_ITEM}'		// ritm number
	},

	// restock task
	'restock': {
		'TEXT': '{BROKEN_SERIAL}',				// restocked asset's serial number
		'Tech': '{LABEL_TECH}',					// technician
		'TEXT_5': 'Passed UEFI diagnostics.',	// repair results
		'RITM#': '{REQUEST_ITEM}'				// ritm number
	}
}

// listen for triggers on the custom event for passing text
document.addEventListener('SNAFU_Inject', function(inject) {
	var ticketType = snafuGetTicketType();
	var type = inject.detail.type;

	// query for the user informatoin
	if (type === 'userQuery') {
		var assignedTo = g_form.getReference('assigned_to');
		var assignmentGroup = g_form.getReference('assignment_group');

		if (snafuIsVarEmpty(assignedTo.name) === false && snafuIsVarEmpty(assignmentGroup.name) === false) {
			// query the user info sent by the options page
			var query = document.createEvent('CustomEvent');
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
	
	// assign task or incident to the user
	} else if (type === 'assignToMe') {
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

	// send success (info) messagea
	} else if (type === 'sendSuccessMsg') {
		snafuInfoMessage(inject.detail.statusMsg);
	
	// send error message
	} else if (type === 'sendErrorMsg') {
		snafuErrorMessage(inject.detail.statusMsg);

	// save the page (via keybinding)
	} else if (type === 'savePage') {
		snafuInfoMessage(snafuSprintf('Saving page in %s seconds.  Please wait...', [inject.detail.finishDelay]));
		setTimeout(function() { g_form.save(); }, inject.detail.finishDelay * 1000);

	// update the page (via keybinding)
	} else if (type === 'updatePage') {
		snafuInfoMessage(snafuSprintf('Updating page in %s seconds.  Please wait...', [inject.detail.finishDelay]));
		setTimeout(function() { g_form.submit(); }, inject.detail.finishDelay * 1000);

	// print label from context menu
	} else if (type.indexOf('printLabel') !== -1) {
		if (ticketType === false || type.indexOf('printLabel') === -1) {
			snafuErrorMessage('The open ticket is not valid for label printing.');
		} else {
			// make sure we have a valid printer
			var printers = dymo.label.framework.getPrinters().filter(function(printer) { return (printer.isConnected === true && printer.isLocal === true) });
			if (printers.length > 0) {
	
				// get the printer's name as well for printing
				var printerName = printers[0]['name'];
				if (snafuIsVarEmpty(printerName) === false) {
					
					// determine the label type from the ticket type
					var labelType = type.replace('printLabel', '').toLowerCase();
					if (snafuLabelFields[labelType] === undefined) {
						console.warn('SNAFU: Dymo label type returned invalid.  Skipping print job. . .');
						snafuErrorMessage('Dymo label type returned invalid.  Skipping print job. . .');
					} else {
						var addressLabel = dymo.label.framework.openLabelXml(snafuGetDymoLabelXml(labelType));
						var labelFields = snafuLabelFields[labelType];
						var reason = ''
						var canPrint = true;
						for (var field in labelFields) {
							if (labelType === 'reclaim' || labelType === 'repair') {
								if (field === 'TEXT_5') {
									reason = prompt(snafuSprintf('Enter the reason for %s this device.  KEEP IT SHORT!', (labelType === 'reclaim') ? ['reclaiming'] : ['repairing']));
									if (snafuIsVarEmpty(reason) === true) {
										console.warn('SNAFU: You must provide a valid reason.');
										snafuErrorMessage('You must provide a valid reason.  Skipping print job. . .');
										canPrint = false;
										break;
									} else {
										addressLabel.setObjectText(field, reason);
									}
								} else {
									addressLabel.setObjectText(field, snafuReplaceWildcards(labelFields[field]));
								}
							} else {
								addressLabel.setObjectText(field, snafuReplaceWildcards(labelFields[field]));
							}
						}

						if (canPrint === false) {
							console.warn('SNAFU: Unable to print label due to errors.');
						} else {
							addressLabel.print(printerName);
						}
					}
				} else {
					console.warn('SNAFU: Unable to determine printer name.  Skipping print job. . .');
					snafuErrorMessage('Unable to determine printer name.  Skipping print job. . .');
				}
			} else {
				console.warn('SNAFU: No appropriate printers were found.  Skipping print job. . .');
				snafuErrorMessage('No appropriate printers were found.  Skipping print job. . .');
			}
		}

	// auto ticket detection
	} else if (type === 'autoEnRoute' || type === 'autoHandle' || type === 'autoAcknowledge' || type === 'autoClosure') {
		if (ticketType === false) {
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

			if (error === true ) {
				snafuErrorMessage('Ticket has already been closed.');
			} else {
				if (type === 'autoEnRoute') {
					var ticketAction = ticket.enRoute;
				} else {
					var ticketAction = (type === 'autoAcknowledge') ? ticket.ack : ticket.close;
				}
				
				if (snafuIsVarEmpty(ticketAction) === true) {
					snafuErrorMessage(snafuSprintf('Unable to complete action "%s" on this ticket type (%s).', [type, ticketType]));
				} else {
					// set the field with value
					if (snafuIsVarEmpty(ticket.field) === false && snafuIsVarEmpty(ticketAction.value) === false) {
						snafuSetValue(ticket.field, ticketAction.value);
						snafuFlash(ticket.field);
					}

					// set the work notes
					if (snafuIsVarEmpty(ticketAction.script) === false) {
						snafuSetValue('work_notes', snafuReplaceWildcards(ticketAction.script));
						snafuFlash('work_notes');
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

					// autofinish
					switch (inject.detail.autoFinish) {
						// save (stay on ticket's page)
						case 'save':
							// not going to let incidents be autosaved
							if (ticket.field === 'state' || (ticket.field === 'incident_state' && ticketAction.value !== '6')) {
								// delay 1.5 seconds
								setTimeout(function() { g_form.save(); }, inject.detail.finishDelay * 1000);
							}
							break;
						
						// update (go back to last page)
						case 'update':
							// not going to let incident be autoupdated
							if (ticket.field === 'state' || (ticket.field === 'incident_state' && ticketAction.value !== '6')) {
								// delay 1.5 seconds
								setTimeout(function() { g_form.submit(); }, inject.detail.finishDelay * 1000);
							}
							break;

						// auto (save all updates except closures, which are updated. incidents are never automatically resolved)
						case 'auto':
							// if a closure then update, otherwise save
							if (ticket.field === 'state' && (ticketAction.value === '3' || ticketAction.value === '4')) {
								// update
								setTimeout(function() { g_form.submit(); }, inject.detail.finishDelay * 1000);
							} else if (ticket.field === 'state' || (ticket.field === 'incident_state' && ticketAction.value !== '6')) {
								setTimeout(function() { g_form.save(); }, inject.detail.finishDelay * 1000);
							}
							break;
						
						// neither
						case 'none':
						default:
							break;
					}

					// print labels
					if (inject.detail.printLabels === true && ticketType === 'rhs_reclaim') {
						// make sure we have a valid printer
						var printers = dymo.label.framework.getPrinters().filter(function(printer) { return (printer.isConnected === true && printer.isLocal === true) });
						if (printers.length > 0) {
				
							// get the printer's name as well for printing
							var printerName = printers[0]['name'];
							if (snafuIsVarEmpty(printerName) === false) {
								
								// determine the label type from the ticket type
								var labelType = 'reclaim';
								if (snafuLabelFields[labelType] === undefined) {
									console.warn('SNAFU: Dymo label type returned invalid.  Skipping print job. . .');
									snafuErrorMessage('Dymo label type returned invalid.  Skipping print job. . .');
								} else {
									var addressLabel = dymo.label.framework.openLabelXml(snafuGetDymoLabelXml(labelType));
									var labelFields = snafuLabelFields[labelType];
									var reason = ''
									var canPrint = true;
									for (var field in labelFields) {
										if (labelType === 'reclaim' || labelType === 'repair') {
											if (field === 'TEXT_5') {
												reason = prompt(snafuSprintf('Enter the reason for %s this device.  KEEP IT SHORT!', (labelType === 'reclaim') ? ['reclaiming'] : ['repairing']));
												if (snafuIsVarEmpty(reason) === true) {
													console.warn('SNAFU: You must provide a valid reason.');
													snafuErrorMessage('You must provide a valid reason.  Skipping print job. . .');
													canPrint = false;
													break;
												} else {
													addressLabel.setObjectText(field, reason);
												}
											} else {
												addressLabel.setObjectText(field, snafuReplaceWildcards(labelFields[field]));
											}
										} else {
											addressLabel.setObjectText(field, snafuReplaceWildcards(labelFields[field]));
										}
									}

									if (canPrint === false) {
										console.warn('SNAFU: Unable to print label due to errors.');
									} else {
										addressLabel.print(printerName);
									}
								}
							} else {
								console.warn('SNAFU: Unable to determine printer name.  Skipping print job. . .');
								snafuErrorMessage('Unable to determine printer name.  Skipping print job. . .');
							}
						} else {
							console.warn('SNAFU: No appropriate printers were found.  Skipping print job. . .');
							snafuErrorMessage('No appropriate printers were found.  Skipping print job. . .');
						}
					}
				}
			}				
		} else {
			snafuErrorMessage('Unknown ticket type detected.');
		}

	// handle everything else
	} else {
		// make sure ticket is assigned
		if (snafuIsResolveCode(inject.detail.field, inject.detail.value) === true && g_form.getReference('assigned_to').currentRow === -1) {
			snafuErrorMessage('Unable to send update to unassigned ticket.  Please assign it to yourself and try again.');
		} else {
			var ticketType = snafuGetTicketType();
			var type = inject.detail.type;
			var field = inject.detail.field;
			var value = inject.detail.value;
			var workNotes = (snafuIsVarEmpty(inject.detail.workNotes) === false) ? snafuReplaceWildcards(inject.detail.workNotes) : null;
			var custNotes = (snafuIsVarEmpty(inject.detail.custNotes) === false) ? snafuReplaceWildcards(inject.detail.custNotes) : null;

			if (type.indexOf('closeQuarantine') !== -1 && ticketType !== 'rhs_restock') {
				snafuErrorMessage('Open ticket is not for a quarantined asset');
			} else if (type.indexOf('closeHotSwap') !== -1 && ticketType !== 'rhs_build') {
				snafuErrorMessage('Open ticket is not for a Hot Swap build.');
			} else {

				// set field with value
				if (snafuIsVarEmpty(field) === false && snafuIsVarEmpty(value) === false) {
					snafuSetValue(field, value);
					snafuFlash(field)
				}

				// customer notes (comments)
				if (snafuIsVarEmpty(custNotes) === false) {
					snafuSetValue('comments', custNotes);
					snafuFlash('comments');
				}

				// work notes
				if (snafuIsVarEmpty(workNotes) === false) {
					snafuSetValue('work_notes', workNotes);
					snafuFlash('work_notes');
				}

				// set the resolve message if it is a resolved code (incident only)
				if (field === 'incident_state' && value === '6') {
					snafuSetValue('comments', snafuReplaceWildcards(snafuRslvComments));
					snafuFlash('comments');

					// set to Problem Resolved
					snafuSetValue('close_code', 'Problem Resolved');
					snafuFlash('close_code');

					// spoke to customer
					snafuSetValue('u_customer_communication', 'Spoke to Customer');
					snafuFlash('u_customer_communication');

					if (snafuIsVarEmpty(workNotes) === false) {
						snafuSetValue('close_notes', workNotes);
						snafuFlash('close_notes');
					}

					// attempt to select the Resolve Information tab

				}

				// change the root cause ci and due date for tasks
				if (field === 'state') {
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
					if (value === '-5' && snafuIsVarEmpty(inject.detail.subStatus) === false) {
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
					}
				}

				// if build logging is enabled and closing a hot swap, then log the build
				if (inject.detail.buildLog === true && type.indexOf('closeHotSwap') !== -1 && ticketType === 'rhs_build') {
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
				}

				// autofinish
				switch (inject.detail.autoFinish) {
					// save (stay on ticket's page)
					case 'save':
						// not going to let incidents be autosaved
						if (field === 'state' || (field === 'incident_state' && value !== '6')) {
							// delay 1.5 seconds
							setTimeout(function() { g_form.save(); }, inject.detail.finishDelay * 1000);
						}
						break;
					
					// update (go back to last page)
					case 'update':
						// not going to let incident be autoupdated
						if (field === 'state' || (field === 'incident_state' && value !== '6')) {
							// delay 1.5 seconds
							setTimeout(function() { g_form.submit(); }, inject.detail.finishDelay * 1000);
						}
						break;

					// auto (save all updates except closures, which are updated. incidents are never automatically resolved)
					case 'auto':
						// if a closure then update, otherwise save
						if (field === 'state' && (value === '3' || value === '4')) {
							// update
							setTimeout(function() { g_form.submit(); }, inject.detail.finishDelay * 1000);
						} else if (field === 'state' || (field === 'incident_state' && value !== '6')) {
							setTimeout(function() { g_form.save(); }, inject.detail.finishDelay * 1000);
						}
						break;
					
					// neither
					case 'none':
					default:
						break;
				}

				// print labels
				if (inject.detail.printLabels === true && (type.indexOf('closeQuarantine') !== -1 || type.indexOf('closeHotSwap') !== -1)) {
					// make sure we have a valid printer
					var printers = dymo.label.framework.getPrinters().filter(function(printer) { return (printer.isConnected === true && printer.isLocal === true) });
					if (printers.length > 0) {
			
						// get the printer's name as well for printing
						var printerName = printers[0]['name'];
						if (snafuIsVarEmpty(printerName) === false) {
							
							// determine the label type from the ticket type
							var labelType = (type.indexOf('closeHotSwap') !== -1) ? 'build' : type.replace('closeQuarantine', '').replace('Yes', '').replace('No', '').toLowerCase();
							if (snafuLabelFields[labelType] === undefined) {
								console.info(labelType);
								console.warn('SNAFU: Dymo label type returned invalid.  Skipping print job. . .');
								snafuErrorMessage('Dymo label type returned invalid.  Skipping print job. . .');
							} else {
								var addressLabel = dymo.label.framework.openLabelXml(snafuGetDymoLabelXml(labelType));
								var labelFields = snafuLabelFields[labelType];
								var reason = ''
								var canPrint = true;
								for (var field in labelFields) {
									if (labelType === 'reclaim' || labelType === 'repair') {
										if (field === 'TEXT_5') {
											reason = prompt(snafuSprintf('Enter the reason for %s this device.  KEEP IT SHORT!', (labelType === 'reclaim') ? ['reclaiming'] : ['repairing']));
											if (snafuIsVarEmpty(reason) === true) {
												console.warn('SNAFU: You must provide a valid reason.');
												snafuErrorMessage('You must provide a valid reason.  Skipping print job. . .');
												canPrint = false;
												break;
											} else {
												addressLabel.setObjectText(field, reason);
											}
										} else {
											addressLabel.setObjectText(field, snafuReplaceWildcards(labelFields[field]));
										}
									} else {
										addressLabel.setObjectText(field, snafuReplaceWildcards(labelFields[field]));
									}
								}

								if (canPrint === false) {
									console.warn('SNAFU: Unable to print label due to errors.');
								} else {
									addressLabel.print(printerName);
								}
							}
						} else {
							console.warn('SNAFU: Unable to determine printer name.  Skipping print job. . .');
							snafuErrorMessage('Unable to determine printer name.  Skipping print job. . .');
						}
					} else {
						console.warn('SNAFU: No appropriate printers were found.  Skipping print job. . .');
						snafuErrorMessage('No appropriate printers were found.  Skipping print job. . .');
					}
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
	const wildcards = {
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
		"{REQUEST_ITEM}": "g_form.getReference('request_item').number || 'UNKNOWN';",										// ritm number
		"{REQUESTED_BY}": "snafuUcwords(g_form.getReference('request_item.request.requested_for').name) || 'UNKNOWN';",		// task requested by
		"{REQUESTED_FOR}": "snafuUcwords(g_form.getReference('request_item.u_requested_for').name) || 'UNKNOWN';",			// task requested for
		"{REQUESTED_FOR_CAMPUS}": "snafuGetCampusName(g_form.getValue('requestedfor_campus')) || 'UNKNOWN';",				// requested for campus
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
		"{ABS_MACHINE}": "g_form.getReference('cmdb_ci').name || 'UNKNOWN';",												// absolute install device
		"{LABEL_TECH}": "snafuSprintf('%s %s.', [snafuUcwords(g_form.getReference('request_item.request.requested_for').first_name), g_form.getReference('request_item.request.requested_for').last_name.charAt(0).toUpperCase()]) || 'UNKNOWN';",										
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
 * Determines if the status provided is a resolve code.
 * @param	{String}	field
 * @param	{String}	value
 * @return	{Boolean}
 */
function snafuIsResolveCode(field, value) {
	if (field === 'incident_state') {
		return (value === '6') ? true : false;
	} else if (field === 'state') {
		return (value === '3') ? true : false;
	} else {
		return false
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
 * Get Dymo label XML.
 * @param	{String}	type
 * @return	{String}
 */
function snafuGetDymoLabelXml(type) {
	// dymo label xml
	switch (type) {
		case 'build':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><IsOutlined>false</IsOutlined><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Host Name:</String><Attributes><Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="472.311157226563" Width="1350" Height="360" /></ObjectInfo><ObjectInfo><TextObject><Name>HOSTNAME_TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">DTXXXXXXXXXX</String><Attributes><Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1727.69787597656" Y="480.576568603516" Width="3099.9208984375" Height="345" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>DATE-TIME</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText>Date Built: </PreText><PostText /><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="843.150024414063" Width="3535.39453125" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_3</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Tech: Adam Koch</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="3513" Y="849.599975585938" Width="1440" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">W7, &lt;BUILD&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="2634.90649414063" Y="58" Width="2318.09350585938" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Apps:</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1064.25" Width="452" Height="210" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_6</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Customer:</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277" Width="827" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">RITMXXXXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="3105.6259765625" Y="242.37272644043" Width="1847.3740234375" Height="216" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_2</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">&lt;CUSTOMER&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="1248" Y="1268" Width="2880" Height="225" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_8</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName /><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Top</VerticalAlignment><TextFitMode>ShrinkToFit</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String xml:space="preserve">Office, Skype</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" /></Attributes></Element></StyledText></TextObject><Bounds X="858" Y="1058" Width="2880" Height="210" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>HOSTNAME_TEXT</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><GroupID>-1</GroupID><IsOutlined>False</IsOutlined><Text>DTXXXXXXXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="133" Width="3180" Height="285" /></ObjectInfo></DieCutLabel>';
			break;
		
		case 'decommission':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;SerialNumber&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277.82592773438" Width="3055.73413085938" Height="187.199996948242" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>QuarantineDate</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText></PreText><PostText></PostText><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="648.052490234375" Width="4622" Height="221.363922119141" /></ObjectInfo><ObjectInfo><TextObject><Name>Tech</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Tech&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3163.158203125" Y="1277" Width="1789.84191894531" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>Decommission</String><Attributes><Font Family="Arial" Size="11" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="58" Width="4622" Height="242.819625854492" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Reason&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="967.651062011719" Width="4622" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>RITM0XXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3326.11669921875" Y="360" Width="1626.88342285156" Height="187.199996948242" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>RITM#</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><Text>RITM0XXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="322.519256591797" Width="3145.45361328125" Height="265.037841796875" /></ObjectInfo></DieCutLabel>';
			break;

		case 'reclaim':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;SerialNumber&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277.82592773438" Width="3055.73413085938" Height="187.199996948242" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>QuarantineDate</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText>Date Quarantined: </PreText><PostText></PostText><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="648.052490234375" Width="4622" Height="221.363922119141" /></ObjectInfo><ObjectInfo><TextObject><Name>Tech</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Tech&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3163.158203125" Y="1277" Width="1789.84191894531" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>Quarantine</String><Attributes><Font Family="Arial" Size="11" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="58" Width="4622" Height="242.819625854492" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Reason&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="967.651062011719" Width="4622" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>RITM0XXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3326.11669921875" Y="360" Width="1626.88342285156" Height="187.199996948242" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>RITM#</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><Text>RITM0XXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="322.519256591797" Width="3145.45361328125" Height="265.037841796875" /></ObjectInfo></DieCutLabel>';
			break;
		
		case 'repair':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;SerialNumber&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277.82592773438" Width="3055.73413085938" Height="187.199996948242" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>QuarantineDate</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText>Repair Started: </PreText><PostText></PostText><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="648.052490234375" Width="4622" Height="221.363922119141" /></ObjectInfo><ObjectInfo><TextObject><Name>Tech</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Tech&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3163.158203125" Y="1277" Width="1789.84191894531" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>Repair</String><Attributes><Font Family="Arial" Size="11" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="58" Width="4622" Height="242.819625854492" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Results&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="967.651062011719" Width="4622" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>RITM0XXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3326.11669921875" Y="360" Width="1626.88342285156" Height="187.199996948242" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>RITM#</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><Text>RITM0XXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="322.519256591797" Width="3145.45361328125" Height="265.037841796875" /></ObjectInfo></DieCutLabel>';
			break;

		case 'restock':
			return '<?xml version="1.0" encoding="utf-8"?><DieCutLabel Version="8.0" Units="twips"><PaperOrientation>Landscape</PaperOrientation><Id>Address</Id><PaperName>30252 Address</PaperName><DrawCommands><RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" /></DrawCommands><ObjectInfo><TextObject><Name>TEXT</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;SerialNumber&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="1277.82592773438" Width="3055.73413085938" Height="187.199996948242" /></ObjectInfo><ObjectInfo><DateTimeObject><Name>QuarantineDate</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><DateTimeFormat>LongSystemDate</DateTimeFormat><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><PreText>Restocked: </PreText><PostText></PostText><IncludeTime>False</IncludeTime><Use24HourFormat>False</Use24HourFormat></DateTimeObject><Bounds X="331" Y="648.052490234375" Width="4622" Height="221.363922119141" /></ObjectInfo><ObjectInfo><TextObject><Name>Tech</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Tech&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3163.158203125" Y="1277" Width="1789.84191894531" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_4</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>Restock</String><Attributes><Font Family="Arial" Size="11" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="58" Width="4622" Height="242.819625854492" /></ObjectInfo><ObjectInfo><TextObject><Name>TEXT_5</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Left</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>&lt;Results&gt;</String><Attributes><Font Family="Arial" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="331" Y="967.651062011719" Width="4622" Height="187.199996948242" /></ObjectInfo><ObjectInfo><TextObject><Name>RITM#</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName></LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>False</IsVariable><HorizontalAlignment>Right</HorizontalAlignment><VerticalAlignment>Middle</VerticalAlignment><TextFitMode>None</TextFitMode><UseFullFontHeight>True</UseFullFontHeight><Verticalized>False</Verticalized><StyledText><Element><String>RITM0XXXXX</String><Attributes><Font Family="Arial" Size="9" Bold="True" Italic="False" Underline="False" Strikeout="False" /><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /></Attributes></Element></StyledText></TextObject><Bounds X="3326.11669921875" Y="360" Width="1626.88342285156" Height="187.199996948242" /></ObjectInfo><ObjectInfo><BarcodeObject><Name>BARCODE</Name><ForeColor Alpha="255" Red="0" Green="0" Blue="0" /><BackColor Alpha="0" Red="255" Green="255" Blue="255" /><LinkedObjectName>RITM#</LinkedObjectName><Rotation>Rotation0</Rotation><IsMirrored>False</IsMirrored><IsVariable>True</IsVariable><Text>RITM0XXXXX</Text><Type>Code39</Type><Size>Small</Size><TextPosition>None</TextPosition><TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" /><TextEmbedding>None</TextEmbedding><ECLevel>0</ECLevel><HorizontalAlignment>Left</HorizontalAlignment><QuietZonesPadding Left="0" Top="0" Right="0" Bottom="0" /></BarcodeObject><Bounds X="331" Y="322.519256591797" Width="3145.45361328125" Height="265.037841796875" /></ObjectInfo></DieCutLabel>';
			break;
		
		default:
			return false;
			break;
	}
}