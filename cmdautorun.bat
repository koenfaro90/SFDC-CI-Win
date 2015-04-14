@ECHO OFF
CALL C:\Bin\localAlias.bat

:: to autorun cmdautorun.bat when starting cmd window, do the following:
:: Open the register HKEY_CURRENT_USER\Software\Microsoft\Command Processor.
:: Add an String Value named Autorun and set the value to absolute path of the Alias.bat file. Eg. C:\Bin\cmdautorun.bat
