@echo off

if [%1]==[] goto blank
if [%2]==[] goto blank
if [%3]==[] goto blank
if [%4]==[] goto blank
if [%5]==[] goto blank
goto run

:blank
ECHO Missing param... -DSFUSER=%1 -DSFPWTOKEN=%2 -DSFSERVER=%3 -DTARGETDIR=%4 -DRETRIEVEPACKAGE=%5
echo.
echo Usage: getMetadata ^[SFUSER^] ^[SFPWTOKEN^] ^[SFSERVER^] ^[TARGETDIR^] ^[RETRIEVEPACKAGE^] ^[BUILDFILE^] ^[OUTPUTLOGFILE^]
echo Eg. getMetadata john@doe.com SOID23YFSKJD login.salesforce.com c:\tmp d:\package.xml .\build.xml C:\log\log.txt
echo Invalid parameters: ant -S -l %7 -f %6 %SFLIB% getMetadata -DSFUSER=%1 -DSFPWTOKEN=%2 -DSFSERVER=%3 -DTARGETDIR=%4 -DRETRIEVEPACKAGE=%5 >> %TMPLOGFILE%
EXIT /B 1
goto end

:run
ECHO Fetching metadata. [%1]

IF EXIST %WORKDIR%\lib\ant-salesforce.jar (SET SFLIB=-lib %WORKDIR%\lib\ant-salesforce.jar )

call ant -S -l %7 -f %6 %SFLIB% getMetadata -DSFUSER=%1 -DSFPWTOKEN=%2 -DSFSERVER=%3 -DTARGETDIR=%4 -DRETRIEVEPACKAGE=%5 -DANTLIB=%ANTLIB%
IF NOT "%errorlevel%"=="0" goto anterror
GOTO end

:anterror
ECHO Error retrieving metadata. (%errorlevel%)
EXIT /B 1

:end


