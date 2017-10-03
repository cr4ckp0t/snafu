# SNAFU: Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased [2017-10-02]
### Changed
- Tweaked acknowledgement messages for tasks.

## 1.2.10 [2017-10-01]
### Changed
- No longer using SweetAlerts for reminders, it was preventing the save/update. Now using basic JavaScript alert() function.
- Cleaned up inject code.

## 1.2.9 [2017-09-29]
### Added
- Removals, Disconnects, and installs added to computer reminders.

### Fixed
- Injected data handling is cleaner and more robust.

## 1.2.8 [2017-09-28]
### Added
- Print build label when using Equipment Install form.
- Open computer database when various actions are taken (closing incidents, hot swaps, etc.).

### Changed
- Hostname of pre-built devices will be automatically uppercased.
- Script used when auto-closing deliveries, per Eric's request.
- Ability to select which labels to automatically print.

## 1.2.7 [2017-09-21]
### Fixed
- Close notes will be filled from work or customer notes.
- Typo preventing certain functionality in the injected script.

## 1.2.6 [2017-09-21]
### Added
- Prebuilt device label.

### Changed
- Updated automation to accomodate requested Service Now changes.

## 1.2.5 [2017-09-14]
### Added
- VERY basic resolve type detection based on the Root Cause CI of an incident.

### Fixed
- Broken labels will now print correctly from incidents.

## 1.2.4 [2017-09-13]
### Fixed
- Fixed bug with automatic closures.

## 1.2.3 [2017-09-12]
### Fixed
- Reimage build labels will now print the software correctly.

## 1.2.2 [2017-09-12]
### Added
- Labels will only manually print for tickets for which they're designed.
    - For example, can't manually print a restock label for a build.
- Added label printing for Reimage Only acknowledgements and builds.

### Changed
- Script when closing reimage reclaim tasks.

### ToDo
- Detect laptop or desktop via incident root cause to select appropriate resolve reason.
- Repair/decommission logs (maybe?).

## 1.2.1 [2017-09-07]
### Added
- Build acknowledgement label.

### Changed
- Cleaned up label printing code.
- All strings sent to labels will be run through the shortening function.

## 1.2.0 [2017-09-02]
### Added
- Changelog with Markdown parser, [Showdown](https://github.com/showdownjs/showdown).

### Fixed
- Title of links on various pages.

## 1.1.17 [2017-09-01]
### Added
- Purchase Order label template for Whit.
- Close Repair task to context menu and popup.

## 1.1.16 [2017-08-31]
### Added
- Broken equipment label.

### Changed
- Cleaned up and organized the context menu.
- Builds and software are differentiated via a carriage return in the software field.

### Fixed
- Bug in js/inject.js that could lead to unexpected behavior.
- Fixed typo in js/inject.js.
- Sub-status will now be shown properly when keep notes is selected and On Hold is checked.

## 1.1.15 [2017-08-24]
### Added
- Automatic handling of Application Install requests.

### Changed
- Labels now use the technicians name who opened the ticket when printing labels.

### Fixed
- Reclaim labels will now print correctly.

## 1.1.14 [2017-08-23]
### Fixed
- Reverted Dymo framework, which was breaking all functionality.

## 1.1.13 [2017-08-22]
### Added
- Automatic handling of Smart Hands requests.
- Label printing via the Dymo Web Framework.

### Removed
- Label files.  They are now hard-coded into js/inject.js.

### Fixed
- Updated work note scripts to account for repair workflow changes.
- Small type in the main content script.

## 1.1.12 [2017-08-21]
### Fixed
- Fixed pathing issues related to the folder structure change, which caused the malfunctions.

## 1.1.11 [2017-08-20]
### Added
- Cancelled Task workflow automation.

### Changed
- Cleaned up the context menu code to make changes more efficient to implement.
- Moved HTML files to html/ subfolder for continuity's sake.
- Updated HTML, JS, and CSS file locations to account for the above change.
- JavaScript and CSS are minified for smaller filesizes to minimize load on Service Now.

### Removed
- Utilize Chrome notifications and alarms for clock in/out.

## 1.1.10 [2017-08-14]
### Added
- Automatically clicks the Resolve Information tab when closing incidents.
- Support for task sub-state options.

## 1.1.9 [2017-08-04]
### Added
- Added snafu keyword for custom search provider.
- Auto-Closure script for SPR and hardware delivery tasks.

### Fixed
- Small bug with context menus related to updating the menus after a settings change.

## 1.1.8 [2017-08-03]
### Added
- Extension will now ask for additional permissions related to alarms and notifications.

### Changed
- Added functionality to automate the improved repair workflow for on-site repairs.

## 1.1.7 [2017-07-28]
### Added
- Clear on Submit option added to the context menu.
- Time calculator to determine correct Clock out time to get full 8 hours.

## 1.1.6 [2017-07-26]
### Fixed
- Fixed auto-handling of tickets in order to improve reliability.
- Fixed typo when processing persistent notes.

## 1.1.5 [2017-07-25]
### Added
- Ability to export build list to CSV file has been added.
- Option to persist notes even after submitting (disabled by default).

### Changed
- Changed labels for automatic ticket handling.
- Cleaned up context menu code.
- Cleaned up options window.

## 1.1.4 [2017-06-20]
### Added
- Button to popup to quickly bring up the Service Catalog.
- Miscellaneous section to context menu.

### Fixed
- {REQUESTED_BY} wildcard now pulls the correct information.
- Clicking Scheduled button will reset the notes/status.
- Clicking Send Equipment button will reset the notes/status.
- Extension will allow updating ticket that isn't assigned to you, as long as it's not being resolved.

## 1.1.3 [2017-06-12]
### Added
- Loaner equipment closures will now be handled automatically.
- Add "En Route" messages to auto-detection.
- Added "Auto En Route" context menu.
- Ticket statuses (In Progress, On Hold, etc.) are now persistent, alongside the notes (via keepNotes).

### Fixed
- Incidents will now be handled automatically correctly.

### Changed
- Modified closure script for SPR installs.
- Modified closure script for Equipment Move/Removes.

## 1.1.2 [2017-06-06]
### Added
- Keybind for automatic handling of tickets. Default key is Alt+A.
- Logging of Hot Swap builds have been added.  Must be enabled in the options.

### Fixed
- Scheduled tasks will now correctly process the wildcards.
- Request item wildcard will now pull the correct data.

### Changed
- Changed default key for Assign To Me/Query User Info to Alt+Q.

## 1.1.1 [2017-06-03]
### Added
- Equipment moves and removal requests are now auto-detected.
- SPR workflow tasks are now auto-dectected.
- Install Absolute tickets are now auto-detected.
- Loaner workflow tasks are now auto-detected.

### Fixed
- Auto-detected scripts will now have their wildcards replaced.

## 1.1.0 [2017-06-02]
### Added
- Scheduled option to put a ticket on hold with an appointment message.
- Keybinds to save and update the page.  Alt+S (Save) and Alt+U (Update) are the default keys.
- Keybind to query user info and assign to technician.  Alt+A is default.
- Notes can now be made persistent until you send the update.
- Prevent extension from closing ticket when unassigned.
- Made acknowledgements and closures automatically detect the type of ticket and respond accordingly.
- Option to automatically close the Epic Hyperspace and BCA device popups.

### Removed
- Monitor Assignment Group settings.  Will put them back when I decide to write the code.

### Fixed
- Send on Enter will be ignored if holding Shift, Ctrl, or Alt.
- Enable/Disable options will now be set correctly via context menus.

## 1.0.6 [2017-05-24]
### Added
- Additional note to quarantine closure script.
- About dialogs to the Help and FAQ pages.
- Glyph icons provided by Bootstrap.
- Option to send the update by pressing Enter.
- Titles to buttons for descriptions.
- New context menus for acknowledgements and closures.
- Sets Close Codes and Customer Communication fields when resolving incidents.

### Changed
- Changed how context menus are handled.  All are now sent through one handler function to make modifying the menus easier for me.

### Fixed
- Standarized the navigation bars on the Help, FAQ, and Options pages.
- {INC_EMAIL} now pulls the correct information from the page.

## 1.0.5 [2017-05-15]
### Added
- Finished Frequently Asked Questions page.
- Extension's popup will only be available while GHS' ServiceNow is the active tab.
- Options and Close Window button to the FAQ page.
- FAQ and Help button to the options page.
- Navigation bar to FAQ and Options pages for standardization.

### Fixed
- Incidents will now save with autoFinish set to auto, but not if being resolved.
- Clarified error if unable to pull user information from a ticket.

## 1.0.4 [2017-05-14]
### Added
- Automatic mode for ticket updates. All updates aside from task closures will be saved.  Task closures will be updated.
- Options context menu to quickly change certain settings.
- Frequently Asked Questions page (unfinished).

### Fixed
- Assign To Me context menus will be hidden using documentUrlPattern.

## 1.0.3 [2017-05-11]
### Added
- finishDelay setting to delay when automatically updating or saving an update.
- Wildcard fields to insert the 40+ wildcards in to the customer and work note fields.
- Context menus to open Help and Options page.
- README link to view CHANGELOG.

### Fixed
- Wonky canned message additions made to customer and work notes field.
- Assign To Me context menu now functions as intended.