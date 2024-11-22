@echo off
setlocal enabledelayedexpansion

:: Get current date and time for the backup timestamp in 'yyyy-MM-dd_hh-mm-ss-APM' format
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
  set year=%%d
  set month=%%b
  set day=%%c
)

:: Get the current hour and minute
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
  set hour=%%a
  set minute=%%b
)

:: Determine AM/PM and convert hour to 12-hour format
set ampm=AM
if %hour% geq 12 (
  set ampm=PM
  if %hour% gtr 12 (
    set /a hour=%hour%-12
  )
)
if %hour% lss 10 set hour=0%hour%

:: Format timestamp as yyyy-MM-dd_hh-mm-ss-APM
set timestamp=%year%-%month%-%day%_%hour%-%minute%-00-%ampm%

:: Set Mongo URI and backup directory
set MONGO_URI=mongodb+srv://shiroshinomiya3013:maricar3013@cluster0.lzfzy.mongodb.net/adminis
set BACKUP_DIR="C:\Users\ryans\OneDrive\Desktop\capstone\system\backup\%timestamp%"

:: Create backup directory
mkdir "%BACKUP_DIR%"

:: Run mongodump (no timestamp, direct to backup directory)
mongodump --uri="%MONGO_URI%" --out="%BACKUP_DIR%"

:: Check if mongodump was successful
if %ERRORLEVEL% equ 0 (
  echo Backup successfully created at %BACKUP_DIR%
) else (
  echo Backup failed!
  exit /b 1
)
