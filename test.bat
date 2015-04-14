@ECHO OFF
setlocal ENABLEDELAYEDEXPANSION
SET RUNSCRIPT=TEST
:: Get general properties
call getSettings.bat %1
call callinfo.bat

endlocal