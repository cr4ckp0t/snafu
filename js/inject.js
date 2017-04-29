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
 * we have to use Service Now's g_form JavaScript object in order to
 * access fields and inputs correctly.  Chrome extensions do not
 * access to page variables we have to inject code and use Custom Events
 * to pass data between the extension and page.
 **/

var snafuRslvComments = "My name is {TECHNAME} and I was the technician that assisted you with {TICKET}. Thank you for the opportunity to provide you with service today with your {CATEGORY}. If for any reason, your issue does not appear to be resolved please contact the Service Desk at (864) 455-8000.";

// listen for triggers on the custom event for passing text
document.addEventListener('SNAFU_Inject', function(snafuInject) {
	
	var snafuType = snafuInject.detail.type;
	var snafuField = snafuInject.detail.field;
	var snafuValue = snafuInject.detail.value;
	var snafuWorkNotes = replaceWildcards(snafuInject.detail.workNotes || '');
	var snafuCustNotes = replaceWildcards(snafuInject.detail.custNotes || '');

	// set field with value
	if (snafuField !== null && snafuValue !== null) {
		g_form.setValue(snafuField, snafuValue);
		g_form.flash(snafuField, '#3eb049', 0);
	}

	// customer notes (comments)
	if (isValueEmpty(snafuCustNotes) === false) {
		g_form.setValue('comments', snafuCustNotes);
		g_form.flash('comments', '#3eb049', 0);
	}

	// work notes
	if (isValueEmpty(snafuWorkNotes) === false) {
		g_form.setValue('work_notes', snafuWorkNotes);
		g_form.flash('work_notes', '#3eb049', 0);
	}

	// set the resolve message if it is a resolved code (incident only)
	if (snafuField === 'incident_state' && snafuValue === '6') {
		g_form.setValue('comments', replaceWildcards(snafuRslvComments));
		g_form.flash('comments', '#3eb049', 0);
	}

	// change the root cause ci and due date for tasks
	if (snafuField === 'state') {
		var snafuDueDate = snafuGetDueDate();

		// due date
		if (g_form.getValue('due_date') !== snafuDueDate) {
			g_form.setValue('due_date', snafuDueDate);
			g_form.flash('due_date', '#3eb049', 0);
		}

		// root cause ci
		// desktop services value is 5a8d6816a1cf38003a42245d1035d56e
		if (g_form.getValue('cmdb_ci') !== '5a8d6816a1cf38003a42245d1035d56e') {
			g_form.setValue('cmdb_ci', '5a8d6816a1cf38003a42245d1035d56e', 'Desktop Services');
			g_form.flash('cmdb_ci', '#3eb049', 0);
		}
	}
	
	//console.log('autoFinish: ' + snafuInject.detail.autoFinish);

	// autofinish
	switch (snafuInject.detail.autoFinish) {
		// save (stay on ticket's page)
		case 'save':
			// not going to let incidents be autosaved
			if (snafuField === 'state' || (snafuField === 'incident_state' && snafuValue !== '6')) {
				// delay 1.5 seconds
				setTimeout(function() { g_form.save(); }, 1500);
			}
			break;
		
		// update (go back to last page)
		case 'update':
			// not going to let incident be autoupdated
			if (snafuField === 'state' || (snafuField === 'incident_state' && snafuValue !== '6')) {
				// delay 1.5 seconds
				setTimeout(function() { g_form.submit() }, 1500);
			}
			break;
		
		// neither
		case 'none':
		default:
			break;
	}
});

function snafuGetDueDate() {
    var d = new Date();
    return ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + '-' + d.getFullYear() + ' 17:00:00';
}

function replaceWildcards(strIn) {
	if (strIn.search('{TICKET}') !== -1) strIn = strIn.replace('{TICKET}', g_form.getValue('number') || 'UNKNOWN');
	if (strIn.search('{CATEGORY}') !== -1) strIn = strIn.replace('{CATEGORY}', g_form.getValue('u_incident_type') || 'UNKNOWN');
	if (strIn.search('{NUMBER}') !== -1) strIn = strIn.replace('{NUMBER}', g_form.getValue('u_current_phone') || 'UNKNOWN');
	if (strIn.search('{BUILD}') !== -1) strIn = strIn.replace('{BUILD}', g_form.getValue('rhs_software') || 'UNKNOWN');
	if (strIn.search('{MODEL}') !== -1 || strIn.search('{ASSET}') !== -1 || strIn.search('{HOSTNAME}') !== -1) {
		var replacement = g_form.getReference('rhs_replacement_computer');
		var model = new GlideRecord('cmdb_model');
		model.addQuery('sys_id', replacement.model_id);
		model.query();
		strIn = strIn.replace('{MODEL}', (model.next()) ? model.name : 'UNKNOWN');
		strIn = strIn.replace('{ASSET}', replacement.asset_tag || 'UNKNOWN');
		strIn = strIn.replace('{HOSTNAME}', replacement.name || 'UNKNOWN');
	}
	if (strIn.search('{ENDUSER}') !== -1) {
		strIn = strIn.replace('{ENDUSER}', function(x) {
			var callerId = g_form.getReference('caller_id').first_name;
			return callerId.charAt(0).toUpperCase() + callerId.slice(1).toLowerCase();
		});
	}
	if (strIn.search('{TECHNAME}') !== -1) {
		strIn = strIn.replace('{TECHNAME}', function(x) {
			var assignedTo = g_form.getReference('assigned_to').first_name;
			return assignedTo.charAt(0).toUpperCase() + assignedTo.slice(1).toLowerCase();
		});
	}

	return strIn;
}

function isValueEmpty(value) {
    return (value === null || value === undefined || value === NaN || value.trim() === '') ? true : false
}