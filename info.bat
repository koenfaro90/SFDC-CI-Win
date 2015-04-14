@ECHO OFF
setlocal ENABLEDELAYEDEXPANSION
SET "RUNSCRIPT=Info"
:: Get general properties
call getSettings.bat
call callinfo.bat
endlocal