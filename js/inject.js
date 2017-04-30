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
 * access to page variables, so we have to inject code and use Custom Events
 * to pass data between the extension and page.
 **/

var snafuRslvComments = "My name is {TECH_NAME} and I was the technician that assisted you with {TICKET}. Thank you for the opportunity to provide you with service today with your {INC_TYPE}. If for any reason, your issue does not appear to be resolved please contact the Service Desk at (864) 455-8000.";

// listen for triggers on the custom event for passing text
document.addEventListener('SNAFU_Inject', function(snafuInject) {
	var snafuType = snafuInject.detail.type;
	var snafuField = snafuInject.detail.field;
	var snafuValue = snafuInject.detail.value;
	var snafuWorkNotes = (isVarEmpty(snafuInject.detail.workNotes) === false) ? replaceWildcards(snafuInject.detail.workNotes) : null;
	var snafuCustNotes = (isVarEmpty(snafuInject.detail.custNotes) === false) ? replaceWildcards(snafuInject.detail.custNotes) : null;

	// set field with value
	if (snafuField !== null && snafuValue !== null) {
		g_form.setValue(snafuField, snafuValue);
		g_form.flash(snafuField, '#3eb049', 0);
	}

	// customer notes (comments)
	if (isVarEmpty(snafuCustNotes) === false) {
		g_form.setValue('comments', snafuCustNotes);
		g_form.flash('comments', '#3eb049', 0);
	}

	// work notes
	if (isVarEmpty(snafuWorkNotes) === false) {
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

// replace wildcards in the notes using eval() and regular expressions
function replaceWildcards(strIn) {
	// object containing the code to be eval'd as a replacement for the wildcards
	var wildcards = {
		// global
		"{ASSIGN_GROUP}": "g_form.getReference('assignment_group').name;",
		"{OPENED}": "g_form.getValue('opened_at');",
		"{OPENED_BY}": "g_form.getValue('opened_by_label');",
		"{ROOT_CAUSE}": "g_form.getReference('cmdb_ci').name;",
		"{TECH_NAME}": "ucwords(g_form.getReference('assigned_to').name);",
		"{TICKET}": "g_form.getValue('number');",

		//incident only
		"{INC_ADDR}": "ucwords(g_form.getReference('u_street_address').u_name);",
		"{INC_ADD_LOC}": "g_form.getValue('u_location_description');",
		"{INC_ALT_PHONE}": "g_form.getValue('u_alternate_phone');",
		"{INC_CAMPUS}": "g_form.getValue('u_campus');",
		"{INC_CUR_PHONE}": "g_form.getValue('u_current_phone');",
		"{INC_CUSTOMER}": "ucwords(g_form.getReference('caller_id').name);",
		"{INC_DETAIL_DESC}": "g_form.getValue('description');",
		"{INC_EMAIL}": "g_form.getValue('email');",
		"{INC_IMPACT}": "g_form.getValue('impact');",
		"{INC_KB}": "g_form.getReference('u_kb_article').number;",
		"{INC_LOC_TYPE}": "g_form.getValue('u_location_type');",
		"{INC_PRACTICE}": "ucwords(g_form.getReference('u_practice_name').name);",
		"{INC_PRIORITY}": "g_form.getValue('priority');",
		"{INC_SHORT_DESC}": "g_form.getValue('short_description');",
		"{INC_TYPE}": "g_form.getValue('u_incident_type');",
		"{INC_TYPE_2}": "g_form.getValue('u_incident_type_2');",
		"{INC_TYPE_3}": "g_form.getValue('u_incident_type_3');",
		"{INC_URGENCY}": "g_form.getValue('urgency');",

		// task only
		"{CATEGORY_ITEM}": "g_form.getValue('cat_item');",
		"{DUE_DATE}": "g_form.getValue('due_date');",
		"{REQUEST_ITEM}": "g_form.getValue('request_item');",
		"{REQUESTED_BY}": "ucwords(g_form.getReference('requested_for').name);",
		"{REQUESTED_FOR}": "ucwords(g_form.getReference('u_requested_for').name);",

		// hot swap only
		"{BROKEN_ASSET}": "g_form.getReference('rhs_comp_name').asset_tag;",
		"{BROKEN_HOSTNAME}": "g_form.getReference('rhs_comp.name').name;",
		"{BROKEN_MODEL}": "getComputerModel(g_form.getReference('rhs_comp_name').model_id);",
		"{RELATED_INC}": "g_form.getReference('rhs_inc').number;",
		"{REPLACE_ASSET}": "g_form.getReference('rhs_replacement_computer').asset_tag;",
		"{REPLACE_BUILD}": "g_form.getValue('rhs_software');",
		"{REPLACE_CUSTOMER}": "ucwords(g_form.getReference('rhs_user').name);",
		"{REPLACE_HOSTNAME}": "g_form.getReference('rhs_replacement_computer').name;",
		"{REPLACE_MODEL}": "getComputerModel(g_form.getReference('rhs_replacement_computer').model_id);"
	};

	return strIn.replace(/\{(.+?)\}/g, function(match) {
		// if the match is found in the wildcards then it will eval the code and return the output
		// if not, then it will be replaced with UNKNOWN (to prevent shenanigans)
		return (match in wildcards) ? eval(wildcards[match]) : 'UNKNOWN';
	});	
}

function getComputerModel(model_id) {
	var model = new GlideRecord('cmdb_model');
	model.addQuery('sys_id', model_id);
	model.query()
	return (model.next()) ? model.name : 'UNKNOWN';
}

function isVarEmpty(value) {
    return (value === null || value === undefined || value === NaN || value.trim() === '') ? true : false
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

// similar to php's ucwords
function ucwords(str) {
	return str.toLowerCase().replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function(e) {
		return e.toUpperCase();
	});
}