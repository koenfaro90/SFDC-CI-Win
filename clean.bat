@echo off

if NOT [%1]==[] ( SET CLEANCONFIG=%1)
if [%WORKDIR%]==[] goto noworkdir
goto check

:noworkdir
ECHO Missing working directory

EXIT /B 1
goto end

:check
if [%CLEANCONFIG%]==[] goto nocleanconfig
goto run

:run
ECHO Running cleanup with config [%CLEANCONFIG%] [%WORKDIR%]
node.exe %SCRIPTDIR%\cleanup\clean.js -c %CLEANCONFIG% -p "%WORKDIR%"

GOTO end

:nocleanconfig
ECHO No clean configuration found - not cleaning

:end
ECHO Cleanup end
