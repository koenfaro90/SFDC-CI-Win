@ECHO OFF
setlocal ENABLEDELAYEDEXPANSION
SET RUNSCRIPT=TEST
:: Get general properties
call getSettings.bat %1
call ant -lib %WORKDIR%\lib\xmltask.jar -l %TMPLOGFILE% -f %BUILDXML% testCleanup -DPACKAGEFOLDER=%SRCFOLDER% -DDESTINATION=%REQENV%

endlocal