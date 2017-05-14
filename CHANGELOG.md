# SNAFU: Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 1.0.4 [2017-05-14]
### Added
- Automatic mode for ticket updates. All updates aside from task closures will be saved.  Task closures will be updated.
- Options context menu to quickly change certain settings.
- Frequently Asked Questions page (unfinished).

### Fixed
- Assign To Me context menus will be hidden using documentUrlPattern.

### Planned
- Status messages will be handled by Service Now via g_form's API.

## 1.0.3 [2017-05-11]
### Added
- finishDelay setting to delay when automatically updating or saving an update.
- Wildcard fields to insert the 40+ wildcards in to the customer and work note fields.
- Context menus to open Help and Options page.
- README link to view CHANGELOG.

### Fixed
- Wonky canned message additions made to customer and work notes field.
- Assign To Me context menu now functions as intended.