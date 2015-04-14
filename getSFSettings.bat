@echo off

if [%1]==[] goto blank
if [%2]==[] goto blank
goto run

:blank
echo.
echo Only call from other scripts, do not leave passwords exposed as env.variables after script is finished
echo Usage: getSFSettings ^[PROJECT^] ^[ENVIRONMENT^] 
echo Eg. getSFSettings PROJECTX dev
goto end

:run
IF EXIST %SCRIPTDIR%\mountCredStore.bat CALL mountCredStore.bat
IF NOT EXIST %SFCREDSTORE% GOTO missingsettings

:: Get sf credentials		
FOR /F "tokens=1,2 delims==" %%G IN (%SFCREDSTORE%) DO ( 
	set %%G=%%H 
	FOR /F "tokens=1,2,3 delims=." %%I IN ("%%G") DO (
		IF %%I==%1 (
			IF %%J==%2 (SET %%K=%%H)
		)
	)
	set %%G=
)
goto end

:missingsettings
set ERRORMSG=%SFCREDSTORE% not found... (getSFSettings.bat)
goto error

:error
ECHO ERROR: %ERRORMSG%
EXIT /B 1

:end