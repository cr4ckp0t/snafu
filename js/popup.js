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
    $('#alertSuccess').hide();
    $('#alertFailed').hide();
    $('span[id^=comp]').hide();
    $('[data-toggle="tooltip"]').tooltip();

    var autoFinish
    var helpUrl = chrome.extension.getURL('help.html');

    chrome.storage.sync.get(['autoTicket'], function(items) {
        if (isValueEmpty(items.autoTicket) === true) {
            $('input[value=none]').prop('checked', true);
            autoFinish = 'none';
        } else {
            $('input[value=' + items.autoTicket +']').prop('checked', true);
            autoFinish = items.autoTicket;
        }
        updateTicketLabels(autoFinish);
    });

    // save ticket when submitted
    $('#autoTicket-save').click(function() {
        chrome.storage.sync.set({autoTicket: 'save'});
        autoFinish = 'save';
        updateTicketLabels(autoFinish);
    });
    
    // update ticket when submitted
    $('#autoTicket-update').click(function() {
        chrome.storage.sync.set({autoTicket: 'update'});
        autoFinish = 'update';
        updateTicketLabels(autoFinish);
    });

    // do nothing with ticket when submitted
    $('#autoTicket-none').click(function() {
        chrome.storage.sync.set({autoTicket: 'none'});
        autoFinish = 'none';
        updateTicketLabels(autoFinish);
    });

    // save ticket when submitted
    $('#autoEquipTicket-save').click(function() {
        chrome.storage.sync.set({autoTicket: 'save'});
        autoFinish = 'save';
        updateTicketLabels(autoFinish);
    });
    
    // update ticket when submitted
    $('#autoEquipTicket-update').click(function() {
        chrome.storage.sync.set({autoTicket: 'update'});
        autoFinish = 'update';
        updateTicketLabels(autoFinish);
    });

    // do nothing with ticket when submitted
    $('#autoEquipTicket-none').click(function() {
        chrome.storage.sync.set({autoTicket: 'none'});
        autoFinish = 'none';
        updateTicketLabels(autoFinish);
    });

    // acknowledge incident
    $('#ackIncident').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'ackIncident',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Incident acknowledgement sent.');
                }
            });
        });
    });

    // acknowledge incident (call user)
    $('#ackCallUser').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'ackCallUser',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Incident acknowledgement sent.');
                }
            });
        });
    });

    // acknowledge task
    $('#ackTask').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'ackTask',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Task acknowledgement sent.');
                }
            });
        });
        
    });

    // acknowledge build
    $('#ackBuild').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'ackBuild',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Build acknowledgement sent.');
                }
            });
        });
    });

    // acknowledge quarantine
    $('#ackQuarantine').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'ackQuarantine',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Quarantine acknowledgement sent.');
                }
            });
        });
    });

    // acknowledge reclaim task
    $('#ackReclaim').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'ackReclaim',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Reclaim acknowledgement sent.');
                }
            });
        });
    });

    // close quarantine
    $('#closeHotSwap').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'closeHotSwap',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Hot Swap closure sent.');
                }
            });
        });
    });

    // close install task
    $('#closeInstall').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'closeInstall',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Install closure sent.');
                }
            });
        });
    });

    // close quarantine
    $('#closeQuarantine').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'closeQuarantine',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Quarantine closure sent.');
                }
            });
        });
    });

    // close reclaim task
    $('#closeReclaim').click(function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'closeReclaim',
                autoFinish: autoFinish
            }, function(response) {
                if (response.success === false) {
                    sendError(response.errMsg);
                } else {
                    sendSuccess('Reclaim closure sent.');
                }
            });
        });
    });

    // send ticket update
    $('#sendUpdate').click(function() {
        if ($('input[name=tStatus]:checked').val() === '1' && isValueEmpty($('#customerNotes').val()) === '') {
            sendError('Pending tickets must have customer notes.');
        } else if (isValueEmpty($('#customerNotes').val()) === true && isValueEmpty($('#workNotes').val()) === true) {
            sendError('You must provide customer and/or work notes.');
        } else {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'sendUpdate',
                    autoFinish: autoFinish,
                    tState: $('input[name=tStatus]:checked').val(),
                    workNotes: $('#workNotes').val(),
                    custNotes: $('#customerNotes').val()
                }, function(response) {
                    if (response.success === false) {
                        sendError(response.errMsg);
                    } else {
                        sendSuccess('Update sent!');
                    }
                });
            });
        }
    });

    $('#sendEquipment').click(function() {
        if (isValueEmpty($('#compHost').val()) === true || isValueEmpty($('#compAsset').val()) === true || isValueEmpty($('#compModel').val()) === true || isValueEmpty($('#compBuild').val()) === true) {
            sendError('You must provide valid input.');
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
                    autoFinish: autoFinish,
                    tState: '3',    // closed complete
                    workNotes: equipWorkNotes,
                    custNotes: null
                }, function(response) {
                    if (response.success === false) {
                        sendError(response.errMsg);
                    } else {
                        sendSuccess('Equipment Order closure sent.');
                    }
                });
            });
        }
    });

    // open help page
    $('#getHelp').click(function() {
        chrome.tabs.create({ url: helpUrl });
    });

    // open help page (equipment tab)
    $('#getHelp2').click(function() {
        chrome.tabs.create({ url: helpUrl });
    });
});

function sendSuccess(alert) {
    var status = document.getElementById('alertSuccess');
    status.textContent = alert;
    $('#alertSuccess').fadeIn();
    setTimeout(function() {
        $('#alertSuccess').fadeOut();
    }, 3000);
}

function sendError(alert) {
    var status = document.getElementById('alertFailed');
    status.textContent = alert;
    $('#alertFailed').fadeIn();
    setTimeout(function() {
        $('#alertFailed').fadeOut();
    }, 3000);
}

function updateTicketLabels(autoFinish) {
    // remove active class from each label
    //$('#autoTicket-save').removeClass('active');
    //$('#autoTicket-update').removeClass('active');
    //$('#autoTicket-none').removeClass('active');
    $('[id^=autoTicket]').removeClass('active');
    $('[id^=autoEquipTicket').removeClass('active');

    // set the correct label with active
    $('#autoTicket-' + autoFinish).addClass('active');
    $('#autoEquipTicket-' + autoFinish).addClass('active');
}

function isValueEmpty(value) {
    return (value === null || value === undefined || value === NaN || value === '') ? true : false
}