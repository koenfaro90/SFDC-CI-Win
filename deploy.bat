@echo off
setlocal ENABLEDELAYEDEXPANSION

Set CHECKONLY=TRUE
if [%1]==[] goto blank
if [%2]==[] goto blank

SET RUNSCRIPT=Deploy
call getSettings.bat %1 %2
if "%errorlevel%"=="1" goto missingsettings
call callinfo.bat

IF "%HOOK%"=="" (SET DEPLOYHOOKCONFIG=) ELSE (SET DEPLOYHOOKCONFIG=%HOOK%)

ECHO *********************************************************************************************************
ECHO * This will DEPLOY package %WORKDIR%\%SRCFOLDER% to org: %SFCONTEXT% (user: %SFUSER%)
ECHO *********************************************************************************************************
ECHO:
SET /P ANSWER=Perform Checkonly Deploy? ("Y" CheckOnly deploy, no changes will be made to org. "N" Ok to make changes) (Y/N)
if /i {%ANSWER%}=={n} Set CHECKONLY=FALSE
ECHO:
IF {%CHECKONLY%}=={FALSE} SET /P ANSWER=*** ABOUT TO MAKE CHANGES TO %SFCONTEXT% *** Are you sure? (Y/N)
if /i {%ANSWER%}=={y} goto :run
goto :end

:run
Echo Please wait...
call deployMetadata %SFUSER% %SFPASSWORD% %SFSERVER% %WORKDIR%\%SRCFOLDER% %BUILDXML% %TMPLOGFILE% %CHECKONLY% %DEPLOYHOOKCOMMAND%
set antcallresult=%errorlevel%
IF NOT "%antcallresult%"=="0" goto anterror
goto done

:blank
echo.
echo Usage: deploy ^[PROJECT^] ^[ENVIRONMENT^]
echo Eg. deploy PROJECTX dev
goto end

:missingsettings
set ERRORMSG=Problem loading settings... (%SFUPDATECONTEXT%)
goto aborted

:missingsettings
set ERRORMSG=Problem loading settings...
goto aborted

:anterror
ECHO:
ECHO %HR%
ECHO * Ant Error Log: %TMPLOGFILE%
ECHO %HR%
type %TMPLOGFILE%
ECHO %HR%
call callnotify "ABORTED, DID NOT UPDATE. (%SFCONTEXT%)"
goto end

:aborted
ECHO:
call callnotify "ABORTED, DID NOT DEPLOY. ERROR: %ERRORMSG% (%SFCONTEXT%)"
goto end

:done
ECHO:
call callnotify "SUCCESS. FINISHED DEPLOY"
goto end

:end
endlocal
call unsetAll.bat
