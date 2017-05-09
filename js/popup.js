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

var wildcards = {
    "{ASSIGN_GROUP}": "{ASSIGN_GROUP} - Current assignment group.",
    "{OPENED}": "{OPENED} - Date and time the incident or task was opened.",
    "{OPENED_BY}": "{OPENED_BY} - Whomever opened the task or incident.",
    "{ROOT_CAUSE}": "{ROOT_CAUSE} - Root Cause CI.",
    "{TECH_NAME}": "{TECH_NAME} - Assigned To's name (You!).",
    "{TICKET}": "{TICKET} - Incident or task number.",
    "{INC_ADDR}": "{INC_ADDR} - Customer's street address.",
    "{INC_ADD_LOC}": "{INC_ADD_LOC} - Additional location information.",
    "{INC_ALT_PHONE}": "{INC_ALT_PHONE} - Customer's alternate phone.",
    "{INC_CAMPUS}": "{INC_CAMPUS} - Customer's campus.",
    "{INC_CUR_PHONE}": "{INC_CUR_PHONE} - Customer's current phone.",
    "{INC_CUSTOMER}": "{INC_CUSTOMER} - Customer's full name.",
    "{INC_CUST_FNAME}": "{INC_CUST_FNAME} - Customer's first name.",
    "{INC_CUST_LNAME}": "{INC_CUST_LNAME} - Customer's last name.",
    "{INC_DETAIL_DESC}": "{INC_DETAIL_DESC} - Incident's detailed description.",
    "{INC_EMAIL}": "{INC_EMAIL} - Customer's email.",
    "{INC_IMPACT}": "{INC_IMPACT} - Incident impact.",
    "{INC_KB}": "{INC_KB} - Incident's Knowledge Base article, if provided.",
    "{INC_LOC_TYPE}": "{INC_LOC_TYPE} - Customer's location type (Hospital, Offsite, etc.).",
    "{INC_PRACTICE}": "{INC_PRACTICE} - Customer's practice name.",
    "{INC_PRIORITY}": "{INC_PRIORITY} - Incident priority.",
    "{INC_SHORT_DESC}": "{INC_SHORT_DESC} - Incident's short description.",
    "{INC_STATE}": "{INC_STATE} - Incident's state (In Progress, On Hold, etc..).",
    "{INC_TYPE}": "{INC_TYPE} - Incident Type (Service Degradation, Service Interruption, etc.).",
    "{INC_TYPE_2}": "{INC_TYPE_2} - Incident Type Level 2 (Availability-Performance, Data Related, etc.).",
    "{INC_TYPE_3}": "{INC_TYPE_3} - Incident Type Level 3 (Damaged Hardware, Liquid Damage, etc.).",
    "{INC_URGENCY}": "{INC_URGENCY} - Incident urgency.",
    "{CATEGORY_ITEM}": "{CATEGORY_ITEM} - Task's category item (Asset Management, etc.).",
    "{DUE_DATE}": "{DUE_DATE} - Task's due date.",
    "{REQUEST_ITEM}": "{REQUEST_ITEM} - Request item number.",
    "{REQUESTED_BY}": "{REQUESTED_BY} - Task requested by.",
    "{REQUESTED_FOR}": "{REQUESTED_FOR} - Task requested for.",
    "{TASK_SITE}": "{TASK_SITE} - Task's location (GMH, GrMH, etc.).",
    "{TASK_STATE}": "{TASK_STATE} - Task state (Work In Progress, Pending, etc.).",
    "{BROKEN_ASSET}": "{BROKEN_ASSET} - Broken device's asset tag.",
    "{BROKEN_HOSTNAME}": "{BROKEN_HOSTNAME} - Broken device's hostname.",
    "{BROKEN_MODEL}": "{BROKEN_MODEL} - Broken device's model.",
    "{BROKEN_SERIAL}": "{BROKEN_SERIAL} - Broken device's serial number.",
    "{RELATED_INC}": "{RELATED_INC} - Related incident that lead to the Hot Swap.",
    "{REPLACE_ASSET}": "{REPLACE_ASSET} - Replacement computer's asset tag.",
    "{REPLACE_BUILD}": "{REPLACE_BUILD} - Replacement computer's build/software.",
    "{REPLACE_CUSTOMER}": "{REPLACE_CUSTOMER} - Customer having the device replaced.",
    "{REPLACE_HOSTNAME}": "{REPLACE_HOSTNAME} - Replacement computer's hostname.",
    "{REPLACE_MODEL}": "{REPLACE_MODEL} - Replacement computer's model.",
    "{REPLACE_SERIAL}": "{REPLACE_SERIAL} - Replacement computer's serial number."
}

$(document).ready(function() {
    $('div[id^=alert]').hide();
    $('span[id^=comp]').hide();
    $('[data-toggle="tooltip"]').tooltip();

    // close quarantine submenu
    $('#closeQuarantine').on('click', function(event) {
        $(this).next('ul').toggle();
        event.stopPropagation();
        event.preventDefault();
    });

    // load settings and wildcards
    getSettings();
    loadWildcards();

    // save autoFinish settings
    $('#autoFinish-save').click(function() { saveAutoFinish('save'); });
    $('#autoEquipTicket-save').click(function() { saveAutoFinish('save'); });
    $('#autoFinish-update').click(function() { saveAutoFinish('update'); });
    $('#autoEquipTicket-update').click(function() { saveAutoFinish('update'); });
    $('#autoFinish-none').click(function() { saveAutoFinish('none'); });
    $('#autoEquipTicket-none').click(function() { saveAutoFinish('none'); });

    // wildcards
    $('[id$=Wildcards]').change(function(event) {
        if ($(this).val() !== 'none') {
            var msg = $('#' + event.target.id + ' option[value="' + $(this).val() + '"]').text();
            var textArea = (event.target.id === 'custWildcards') ? '#customerNotes' : '#workNotes';
            chrome.storage.sync.get(['debug'], function(items) {
                if (chrome.runtime.lastError) {
                    console.warn('SNAFU debug Get Error: %s', chrome.runtime.lastError.message);
                } else {
                    console.info('SNAFU msg: %s', msg);
                    console.info('SNAFU textArea: %S', textArea);
                }
            });
            $(textArea).text($(textArea).text() + msg);
            $(this).val('none');
        }
    });

    // canned messages
    $('[id$=CannedMsgs]').change(function(event) {
        if ($(this).val() !== 'none') {
            var msg = $('#' + event.target.id + ' option[value=' + $(this).val() + ']').text();
            var textArea = (event.target.id === 'custCannedMsgs') ? '#customerNotes' : '#workNotes';
            chrome.storage.sync.get(['debug'], function(items) {
                if (items.debug === true) {
                    if (chrome.runtime.lastError) {
                        console.warn('SNAFU debug Get Error: %s', chrome.runtime.lastError.message);
                    } else {
                        console.info('SNAFU msg: %s', msg);
                        console.info('SNAFU textArea: %S', textArea);
                    }
                }
            });
            $(textArea).text($(textArea).text() + msg);
            $(this).val('none');
        }
    });

    // acknowledgement clicks
    $('a[id^=ack]').click(function(event) { processClick(event.target.id); });

    // closure clicks
    $('a[id^=close]').click(function(event) { processClick(event.target.id); });

    // send ticket update
    $('#sendUpdate').click(function() {
        if ($('input[name=tStatus]:checked').val() === '1' && isVarEmpty($('#customerNotes').val()) === '') {
            console.warn('SNAFU Error: Pending tickets must have customer notes.');
        } else if (isVarEmpty($('#customerNotes').val()) === true && isVarEmpty($('#workNotes').val()) === true) {
            console.warn('SNAFU Error: You must provide customer and/or work notes.');
        } else {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'sendUpdate',
                    tState: $('input[name=tStatus]:checked').val(),
                    workNotes: $('#workNotes').val(),
                    custNotes: $('#customerNotes').val()
                }, function(response) {
                    chrome.storage.sync.get(['debug', 'closePopup'], function(items) {
                        if (chrome.runtime.lastError) {
                            console.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
                        } else {
                            if (items.debug === true) {
                                if (isVarEmpty(response) === false) {
                                    if (response.success === false) {
                                        console.warn('SNAFU Error: %s', response.errMsg);
                                    } else {
                                        console.info('SNAFU: Update sent!');
                                    }
                                } else {
                                    console.warn('SNAFU Error: Unable to process response to message.');
                                }
                            }
                        }

                        if (items.closePopup === true) {
                            setTimeout(function() { window.close(); }, 500);
                        }
                    });
                });
            });
        }
    });

    // equipment order update
    $('#sendEquipment').click(function() {
        if (isVarEmpty($('#compHost').val()) === true || isVarEmpty($('#compAsset').val()) === true || isVarEmpty($('#compModel').val()) === true || isVarEmpty($('#compBuild').val()) === true) {
            console.warn('SNAFU Error: You must provide valid input.');
        } else {
            // custom closure script
            var equipWorkNotes = 'Computer has been built. One {MODEL} has been built {BUILD}. Tag {ASSET} HostName {HOSTNAME}. Resolving Task. Placing computer in Deployment Room. Please assign to a tech for install and resolution. Once this ticket is closed, the request will generate another task to have a technician come on site to install the equipment. This is just a ticket to track the build and equipment used. A tech should be calling the customer momentarily to set up a time for installation.';
            equipWorkNotes = equipWorkNotes.replace('{MODEL}', $('#compModel').val());
            equipWorkNotes = equipWorkNotes.replace('{BUILD}', $('#compBuild').val());
            equipWorkNotes = equipWorkNotes.replace('{ASSET}', $('#compAsset').val());
            equipWorkNotes = equipWorkNotes.replace('{HOSTNAME}', $('#compHost').val());
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'sendEquipment',
                    tState: '3',    // closed complete
                    workNotes: equipWorkNotes,
                    custNotes: null
                }, function(response) {
                    chrome.storage.sync.get(['debug', 'closePopup'], function(items) {
                        if (chrome.runtime.lastError) {
                            console.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
                        } else {
                            if (items.debug === true) {
                                if (isVarEmpty(response) === false) {
                                    if (response.success === false) {
                                        console.warn('SNAFU Error: %s', response.errMsg);
                                    } else {
                                        console.info('SNAFU: Update sent!');
                                    }
                                } else {
                                    console.warn('SNAFU Error: Unable to process response to message.');
                                }
                            }

                            if (items.closePopup === true) {
                                setTimeout(function() { window.close(); }, 500);
                            }
                        }
                    });
                });
            });
        }
    });
    
    // open help page
    $('[id^=getHelp]').click(function() {
        var helpUrl = chrome.extension.getURL('help.html');
        chrome.tabs.create({ url: helpUrl });
    });

    // open options page
    $('[id^=openOptions]').click(function() {
        var optionsUrl = chrome.extension.getURL('options.html');
        chrome.tabs.create({ url: optionsUrl });
    });
});

/**
 * Update autoFinish radio labels.
 * @param   {String}    autoFinish
 */
function updateTicketLabels(autoFinish) {
    // remove active class from each label
    $('[id^=autoFinish]').removeClass('active');
    $('[id^=autoEquipTicket').removeClass('active');

    // set the correct label with active
    $('#autoFinish-' + autoFinish).addClass('active');
    $('#autoEquipTicket-' + autoFinish).addClass('active');
}

/**
 * Checks if a variable is empty (null, undefined, NaN, etc.).
 * @param   {String}    value
 * @return  {Boolean}
 */
function isVarEmpty(value) {
    return (value === null || value === undefined || value === NaN || value.toString().trim() === '') ? true : false
}

/**
 * Save autoFinish to chrome.storage.sync.
 * @param   {String}    value
 * @return  {Void}
 */
function saveAutoFinish(value) {
    chrome.storage.sync.set({autoFinish: value}, function() {
        if (chrome.runtime.lastError) {
            console.warn('Sync Set Error: %s', chrome.runtime.lastError.message);
        } else {
            console.info('SNAFU: Saved settings.');
        }
        updateTicketLabels(value);
    });
}

/**
 * Load settings from chrome.storage.sync.
 * @return  {Void}
 */
function getSettings() {
    chrome.storage.sync.get(['autoFinish', 'debug', 'canned'], function(items) {
        if (chrome.runtime.lastError) {
            console.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
        } else {
            if (items.debug === true) {
                console.info('SNAFU: Received settings.');
            }
            updateTicketLabels(items.autoFinish);

            if (items.canned) {
                var cannedMsgs = '<option value="none" selected="selected">---- None ----</option>';
				for (var key in items.canned) {
					if (!items.canned.hasOwnProperty(key)) continue;
					cannedMsgs += ('<option value="{KEY}">{VALUE}</option>').replace('{KEY}', key).replace('{VALUE}', items.canned[key]);
				}
				$('[id$=CannedMsgs]').html(cannedMsgs);
            }
        }
    });
}

/**
 * Process clicks of dropdown menus.
 * @param   {String}    clickType
 */
function processClick(clickType) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: clickType
        }, function(response) {
            chrome.storage.sync.get(['debug', 'closePopup'], function() {
                if (chrome.runtime.lastError) {
                    console.warn('SNAFU Error: %s', chrome.runtime.lastError.message);
                } else if (items.debug === true) {
                    if (isVarEmpty(response) === false) {
                        if (response.success === false) {
                            console.warn('SNAFU Error: %s', response.errMsg);
                        } else {
                            console.info('SNAFU: Update sent!');
                        }
                    } else {
                        console.warn('SNAFU Error: Unable to process response to message.');
                    }
                }

                if (items.closePopup === true) {
                    setTimeout(function() { window.close(); }, 500);
                }
            });
        });
    });
}

/**
 * Load wildcards from object to select form.
 * @return  {Void}
 */
function loadWildcards() {
    var custWildcards = '<option value="none" selected="selected">---- NONE ----</option>';
    var workWildcards = '';
    for (var key in wildcards) {
        custWildcards += ('<option value="{KEY}">{VALUE}</option>').replace('{KEY}', key).replace('{VALUE}', wildcards[key]);
        workWildcards += ('<option value="{KEY}">{VALUE}</option>').replace('{KEY}', key).replace('{VALUE}', wildcards[key]);
    }
    $('#custWildcards').html(custWildcards);
    $('#workWildcards').html(workWildcards);
}