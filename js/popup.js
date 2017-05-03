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
    $('div[id^=alert]').hide();
    $('span[id^=comp]').hide();
    $('[data-toggle="tooltip"]').tooltip();

    var needSpace;

    var cannedMsgs = {
        'callingUser': 'Calling {INC_CUST_FNAME} at {INC_CUR_PHONE}.',
        //'equipDelivered': 'Equipment delivered to {TASK_SITE}.',
        'leftVoicemail': 'Left voicemail for {INC_CUST_FNAME} at {INC_CUR_PHONE} to discuss the ticket.'
    }

    // load settings
    getSettings();

    // save autoFinish settings
    $('#autoFinish-save').click(function() { saveSettings('save'); });
    $('#autoEquipTicket-save').click(function() { saveSettings('save'); });
    $('#autoFinish-update').click(function() { saveSettings('update'); });
    $('#autoEquipTicket-update').click(function() { saveSettings('update'); });
    $('#autoFinish-none').click(function() { saveSettings('none'); });
    $('#autoEquipTicket-none').click(function() { saveSettings('none'); });

    // customer notes canned messages
    $('#custCannedMsgs').change(function() {
        if ($(this).val() !== 'none') {
            needSpace = ($('#customerNotes').val().trim() === '') ? '' : ' ';
            $('#customerNotes').append(needSpace + cannedMsgs[$(this).val()]);
            $(this).val('none');
        }
    });

    // work notes canned messages
    $('#workCannedMsgs').change(function() {
        if ($(this).val() !== 'none') {
            needSpace = ($('#workNotes').val().trim() === '') ? '' : ' ';
            $('#workNotes').append(needSpace + cannedMsgs[$(this).val()]);
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
                    chrome.storage.sync.get(['debug'], function(items) {
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
                    chrome.storage.sync.get(['debug'], function(items) {
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

function updateTicketLabels(autoFinish) {
    // remove active class from each label
    $('[id^=autoFinish]').removeClass('active');
    $('[id^=autoEquipTicket').removeClass('active');

    // set the correct label with active
    $('#autoFinish-' + autoFinish).addClass('active');
    $('#autoEquipTicket-' + autoFinish).addClass('active');
}

function isVarEmpty(value) {
    return (value === null || value === undefined || value === NaN || value.toString().trim() === '') ? true : false
}

// save settings to chrome.storage.sync and update inputs
function saveSettings(value) {
    chrome.storage.sync.set({autoFinish: value}, function() {
        if (chrome.runtime.lastError) {
            console.warn('Sync Set Error: %s', chrome.runtime.lastError.message);
        } else {
            console.info('SNAFU: Saved settings.');
        }
    });

    // remove active class from each label
    $('[id^=autoFinish]').removeClass('active');
    $('[id^=autoEquipTicket').removeClass('active');

    // set the correct label with active
    $('#autoFinish-' + value).addClass('active');
    $('#autoEquipTicket-' + value).addClass('active');
}

// pull settings from chrome.storage.sync and process them
function getSettings() {
    chrome.storage.sync.get(['autoFinish', 'debug'], function(items) {
        if (chrome.runtime.lastError) {
            console.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
        } else {
            if (items.debug === true) {
                console.info('SNAFU: Received settings.');
                updateTicketLabels(items.autoFinish);
            }
        }
    });
}

// process the clicks of the dropdown menus
function processClick(clickType) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type: clickType
        }, function(response) {
            chrome.storage.sync.get(['debug'], function() {
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
            });
        });
    });
}