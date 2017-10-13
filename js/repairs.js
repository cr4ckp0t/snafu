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

var removeEntries = [];

$(document).ready(function() {
	$('#versionAbout').html(chrome.app.getDetails().version);
	$('#alertSuccess').hide();
	$('#alertFailure').hide();
	$('#openOptions').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/options.html')}); });
	$('#openFaq').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/faq.html')}); });
	$('#openHelp').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/help.html')}); });
	$('#openChangelog').click(function() { chrome.tabs.create({url: chrome.runtime.getURL('html/changelog.html')}); });
	$('#closeWindow').click(function() { chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { chrome.tabs.remove(tabs[0].id); }); });

	// reload the log
	$('#reloadLog').click(function() {
		loadRepairs();
		successMessage('Successfully reloaded the repair log.');
	});

	// clear the repair log
	$('#clearLog').click(function() {
		chrome.storage.sync.set({ repairs: {} }, function() {
			if (chrome.runtime.lastError) {
				errorMessage('Failed to reset the repair log.');
			} else {
				successMessage('Successfully reset the repair log.');
			}
			loadRepairs();
		});
	});

	// remove entries
	$('#removeEntries').click(function() {
		if (removeEntries.length === 0) {
			errorMessage('No repairs are selected.');
		} else {
			chrome.storage.sync.get('repairs', function(items) {
				if (chrome.runtime.lastError) {
					errorMessage('Failed to remove entries.');
				} else {
					for (var i = 0; i < removeEntries.length; i++)
						delete items.repairs[removeEntries[i]];
					chrome.storage.sync.set({ repairs: items.repairs }, function() {
						if (chrome.runtime.lastError) {
							errorMessage('Failed to resave the updated repair list.');
						} else {
							successMessage('Updated the repair list.');
						}
					});
					loadRepairs();
				}
			});
		}
	});

	// export csv
	$('#exportCSV').click(function() {
		chrome.storage.sync.get(['debug', 'repairs'], function(items) {
			if (chrome.runtime.lastError) {
				console.warn('SNAFU Sync Get Error; %s', chrome.runtime.lastError.message);
			} else {
				if (items.debug === true) console.info('SNAFU: Generating CSV of repair log.');

				if (Object.keys(items.repairs).length === 0) {
					errorMessage('No repairs have been logged.');
				} else {
					var repairList = 'SysId,Request Item,Date,Hostname,Asset Tag,Model\n';
					for (var repair in items.repairs) {
						repairList += sprintf('%s,%s,%s,%s,%s,%s\n', [items.repairs[repair].sysId, repair, moment(items.repairs[repair].dateTime).format('YYYY-MM-DD HH:mm'), items.repairs[repair].hostname, items.repairs[repair].assetTag, items.repairs[repair].model.replace(',', ' | ')]);
					}
					var objectUrl = URL.createObjectURL(new Blob([repairList], {type: 'text/csv'}));
					var d = new Date();
					chrome.downloads.download({url: objectUrl, filename: sprintf('repairLog-%s.csv', [d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2)]), conflictAction: 'overwrite', saveAs: true});
				}
			}
		});
	});

	/* chrome.storage.sync.set({
		repairs: {
			'RITM0123456': {
				sysId: '83e5ecf36fbe72007839d4a21c3ee453',
				hostname: 'DT2UA1234567',
				assetTag: '53912345',
				dateTime: Date.now(),
				model: '800 Mini'
			},
			'RITM0769101': {
				sysId: '83e5ecf36fbe72007839d4a21c3ee453',
				hostname: 'LT5CG1234567',
				assetTag: '54212345',
				dateTime: Date.now(),
				model: '850 G3'
			}
		}
	}, function() { console.info('SNAFU: Saved dummy repairs.'); }); */

	loadRepairs();
});

// updates removeEntries for when they click to remove repairs
$(document).on('click', '.entry', function() {
	var checked = jQuery('.entry:checked');
	removeEntries = [];
	for (var i = 0; i < checked.length; i++)
		removeEntries.push(checked[i].value);
});

/**
 * Pulls the repairs from settings and loads them in to the table.
 * @return	{Void}
 */
function loadRepairs() {
	chrome.storage.sync.get(['debug', 'repairs'], function(items) {
		if (chrome.runtime.lastError) {
			console.warn('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {
			if (items.debug === true) console.info('SNAFU: Generating repair list.');

			if (Object.keys(items.repairs).length > 0) {
				var innerHtml = '', i = 0;
				var template = '<tr><td><input class="entry" type="checkbox" id="%s" name="removeEntry" value="%s" /></td><td><a href="https://ghsprod.service-now.com/nav_to.do?uri=%2Fsc_req_item.do%3Fsys_id%3D%s" target="_blank">%s</a></td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>\n';
				for (var ritm in items.repairs) {
					i += 1;
					innerHtml += sprintf(template, [i, ritm, items.repairs[ritm].sysId, ritm, moment(items.repairs[ritm].dateTime).format('YYYY-MM-DD HH:mm'), items.repairs[ritm].hostname, items.repairs[ritm].assetTag, items.repairs[ritm].model]);
				}
				$('#repairList').html(innerHtml);
			} else {
				$('#repairList').html('<tr><td colspan="8" style="text-align:center;"><span style="font-style:italic;color:#a0a0a0;">No repairs have been recorded.</span></td></tr>');	
			}
		}
	});
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

/**
 * Set success message.
 * @param	{String}	msg
 */
function successMessage(msg) {
	$('#alertSuccessMsg').text(msg);
	$('#alertSuccess').fadeIn();
	setTimeout(function() { $('#alertSuccess').fadeOut(); }, 2500);
}

/**
 * Set error message.
 * @param	{String}	msg
 */
function errorMessage(msg) {
	$('#alertFailureMsg').text(msg);
	$('#alertFailure').fadeIn();
	setTimeout(function() { $('#alertFailure').fadeOut(); }, 2500);
}

/**
 * Handle the response from the sendMessage call for debugging purposes.
 * @param	{Object}	response
 * @return	{Void}
 */
function handleResponse(response) {
	chrome.storage.sync.get(['debug'], function(items) {
		if (chrome.runtime.lastError) {
			console.error('SNAFU Sync Get Error: %s', chrome.runtime.lastError.message);
		} else {
			if (items.debug === true) {
				if (isVarEmpty(response) === false) {
					if (response.success === false) {
						console.error('SNAFU Error: %s', response.errMsg);
					} else {
						console.info('SNAFU: Update sent!');
					}
				} else {
					console.error('SNAFU Error: Unable to process response to message.');
				}
			}
		}
	});
}

/**
 * Checks if a variable is empty (null, undefined, NaN, etc.).
 * @param   {String}    value
 * @return  {Boolean}
 */
function isVarEmpty(value) {
    return (value === null || value === undefined || value === NaN ) ? true : false
}