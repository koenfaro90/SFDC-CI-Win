::@echo off
Set CHECKONLY=TRUE

if [%1]==[] goto blank ::SFUSER
if [%2]==[] goto blank ::SFPWTOKEN
if [%3]==[] goto blank ::SFSERVER
if [%4]==[] goto blank ::SRCFOLDER
if [%5]==[] goto blank ::BUILDFILE
if [%6]==[] goto blank ::OUTPUTLOGFILE
if "%7"=="FALSE" Set CHECKONLY=FALSE
goto run

:blank
echo Usage: deployMetadata ^[SFUSER^] ^[SFPWTOKEN^] ^[SFSERVER^] ^[PACKAGEFOLDER^] ^[BUILDFILE^] ^[OUTPUTLOGFILE^] ^<^[CHECKONLY^]^>
echo Eg. deployMetadata john@doe.com SOID23YFSKJD login.salesforce.com c:\package\sprint2 build.xml C:\log\tmp.log FALSE
echo Checkonly is TRUE by default. To do an actual deploy use FALSE as last parameter.
echo Invalid parameters: ant -S -l %6 -f %5 %SFLIB% deployPackage -DSFUSER=%1 -DSFPWTOKEN=%2 -DSFSERVER=%3 -DPACKAGEFOLDER=%4 -DSFCHECKONLY=%CHECKONLY% >> %TMPLOGFILE%
EXIT /B 1
goto end

:run
call ant -l %6 -f %5 %SFLIB% deployPackage -DSFUSER=%1 -DSFPWTOKEN=%2 -DSFSERVER=%3 -DPACKAGEFOLDER=%4 -DSFCHECKONLY=%CHECKONLY% -DANTLIB=%ANTLIB% -DDESTINATION=%REQENV%

IF NOT "%errorlevel%"=="0" goto anterror
GOTO end

:anterror
ECHO Error retrieving metadata. (%errorlevel%)
EXIT /B 1

:end



