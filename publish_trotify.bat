@echo off
chcp 65001 >nul
setlocal

cd /d C:\trotify_dashboard

echo.
echo ==================================================
echo Trotify publish started: %date% %time%
echo ==================================================

REM Refresh upcoming_fields.csv from the scraper folder.
echo Copying latest upcoming_fields.csv...
copy /Y "C:\harness_scraper\harness_api\upcoming_fields.csv" "C:\trotify_dashboard\upcoming_fields.csv"
if errorlevel 1 (
    echo ERROR: Failed to copy upcoming_fields.csv.
    exit /b 1
)

REM Refresh merged_meta.json from the scraper folder.
echo Copying latest merged_meta.json...
copy /Y "C:\harness_scraper\harness_api\merged_meta.json" "C:\trotify_dashboard\merged_meta.json"
if errorlevel 1 (
    echo ERROR: Failed to copy merged_meta.json.
    exit /b 1
)

REM Refresh First100 data from the scraper folder.
echo Copying latest first100.json...

if not exist "C:\trotify_dashboard\data" (
    mkdir "C:\trotify_dashboard\data"
)

copy /Y ^
"C:\harness_scraper\harness_api\first100.json" ^
"C:\trotify_dashboard\data\first100.json"

if errorlevel 1 (
    echo ERROR: Failed to copy first100.json.
    exit /b 1
)

REM Make sure the large race chart file is ignored by Git.
git check-ignore -q chart_race_data.json
if errorlevel 1 (
    echo ERROR: chart_race_data.json is NOT being ignored by Git.
    echo Publish aborted to prevent attempting to upload the large file.
    exit /b 1
)

REM Stage all website/data changes. Files in .gitignore remain excluded.
git add .
if errorlevel 1 (
    echo ERROR: git add failed.
    exit /b 1
)

REM Commit only if there are staged changes.
git diff --cached --quiet
if %errorlevel%==0 (
    echo No new local Trotify changes to commit.
) else (
    git commit -m "Automated Trotify update"
    if errorlevel 1 (
        echo ERROR: git commit failed.
        exit /b 1
    )
)

REM Bring down any remote changes after local changes are safely committed.
git pull --rebase origin main
if errorlevel 1 (
    echo ERROR: git pull/rebase failed.
    echo Trotify publish aborted.
    exit /b 1
)

REM Push local commits to GitHub.
git push
if errorlevel 1 (
    echo ERROR: git push failed.
    exit /b 1
)

echo Trotify publish completed successfully: %date% %time%
exit /b 0