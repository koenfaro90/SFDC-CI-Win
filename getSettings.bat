@ECHO OFF
call unsetAll.bat

:: Settings can be requested for a specific Project & Environment (branch/sandbox), if not specified, the project in env.properties and checked-out Git branch will be used 
if NOT [%1]==[] ( SET REQPROJ=%1)
if NOT [%2]==[] ( SET REQENV=%2)

SET LOCALCONF=%~dp0\local.properties
SET ISGITREPO=false

:: Setting defaults
SET WORKDIR=%cd%

:: Set local properties
IF EXIST %LOCALCONF% (
	FOR /F "tokens=1,2 delims==" %%G IN (%LOCALCONF%) DO ( set %%G=%%H)
) ELSE (
	ECHO ###
	ECHO No local settings %LOCALCONF% found, trying defaults (C:\Bin, etc)
	SET SCRIPTDIR=C:\Bin
	SET DEVDIR=C:\Dev
	SET TMPDIR=C:\Tmp
	SET LOGDIR=C:\Log
)

:: Set general properties
SET GENERALCONF=%SCRIPTDIR%\general.properties
IF EXIST %GENERALCONF% (
	:: Set general properties
	FOR /F "tokens=1,2 delims==" %%G IN (%GENERALCONF%) DO ( set %%G=%%H)
) ELSE (
	GOTO missinggeneralsettings
) 

:: Asume folder name == Project name
SET "CDIR=%WORKDIR:~0%"
FOR %%i IN ("%CDIR%") DO SET "SFPROJECT=%%~nxi"

if NOT [%REQPROJ%]==[] ( SET SFPROJECT=%REQPROJ%)

:: Set path to build.xml
IF EXIST %WORKDIR%\build.xml (
	SET BUILDXML=%WORKDIR%\build.xml
	SET ANTLIB=%WORKDIR%\lib
) ELSE (
	SET BUILDXML=%SCRIPTDIR%\build.xml
	SET ANTLIB=%SCRIPTDIR%\lib
)

:: check Git status
git status >nul 2>&1
IF %ERRORLEVEL%==0 SET ISGITREPO=true

IF [!ISGITREPO!]==[true] (
	FOR /f %%i in ('git status --porcelain --untracked-files') do set CHECKGIT=%%i
	IF [!CHECKGIT!]==[] (SET GITSTATUS=clean) ELSE (SET GITSTATUS=dirty)

	FOR /f "delims=" %%a in ('git rev-parse --abbrev-ref HEAD') do set GITBRANCH=%%a
	IF [%REQENV%]==[] SET REQENV=!GITBRANCH!
)

:: Error when project of env not set
if [%SFPROJECT%]==[] goto noProjectSet
if [%REQENV%]==[] goto noEnvironmentSet

:: Get SF settings
call getSFSettings.bat %SFPROJECT% %REQENV%
if "%errorlevel%"=="1" goto errorSFsettings

:: Create timestamp
call timestamp.bat

SET SFCONTEXT=%SFPROJECT%_%REQENV%
SET TMPLOGFILE=%LOGDIR%\%TIMESTAMP%_%RUNSCRIPT%_%SFCONTEXT%.txt
SET TMPBACKUP=%TMPDIR%\%TIMESTAMP%_%RUNSCRIPT%_%SFCONTEXT%_srcbak
SET TMPSRC=%TMPDIR%\%TIMESTAMP%_%RUNSCRIPT%_%SFCONTEXT%_srctmp
::override for deploy
IF %RUNSCRIPT%==Deploy (SET TMPLOGFILE=%LOGDIR%\%TIMESTAMP%_%SFPROJECT%_%GITBRANCH%2%SFCONTEXT%.txt)
set SFPACKAGE=%WORKDIR%\sfpackage.xml

:: all done
goto end

:noProjectSet
set ERRORMSG=No project found.
goto error

:noEnvironmentSet
set ERRORMSG=No Environment found
goto error

:errorSFsettings
set ERRORMSG=Error retrieving SF settings... (%SFCONTEXT%)
goto error

:missinggeneralsettings
set ERRORMSG=%SCRIPTDIR%\general.properties not found... (getGeneralSettings.bat)
goto error

:error
ECHO ERROR: %ERRORMSG%
EXIT /B 1

:end

