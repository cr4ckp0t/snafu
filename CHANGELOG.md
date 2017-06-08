# SNAFU: Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased
### Fixed
- Incidents will now be handled automatically correctly.

### Changed
- Modified closure script for SPR installs.
- Modified closure script for Equipment Move/Removes.

### To Do
- Make ticket statuses persistent, alongside the notes (via keepNotes).

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