@echo off

if NOT [%1]==[] ( SET HOOKCONFIG=%1)
if [%WORKDIR%]==[] goto noworkdir
goto check

:noworkdir
ECHO Missing working directory

EXIT /B 1
goto end

:check
if [%HOOKCONFIG%]==[] goto nohookconfig
goto run

:run
ECHO Running deploy hooks with config [%HOOKCONFIG%] [%WORKDIR%]
node.exe %SCRIPTDIR%\hooks\hooks.js -c %HOOKCONFIG% -s deploy -p "%WORKDIR%"

GOTO end

:nohookconfig
ECHO No hook configuration found

:end
ECHO Deploy hook end
