@echo off
chcp 65001 >nul
setlocal

cd /d C:\trotify_dashboard

echo.
echo ==================================================
echo Trotify publish started: %date% %time%
echo ==================================================

REM Stage all website/data changes. Files in .gitignore remain excluded.
git add .
if errorlevel 1 (
    echo ERROR: git add failed.
    exit /b 1
)

REM If nothing is staged, there is nothing to publish.
git diff --cached --quiet
if %errorlevel%==0 (
    echo No Trotify changes to publish.
    exit /b 0
)

REM Commit the staged changes.
git commit -m "Automated Trotify update"
if errorlevel 1 (
    echo ERROR: git commit failed.
    exit /b 1
)

REM Push the new commit to GitHub.
git push
if errorlevel 1 (
    echo ERROR: git push failed.
    exit /b 1
)

echo Trotify publish completed successfully: %date% %time%
exit /b 0
