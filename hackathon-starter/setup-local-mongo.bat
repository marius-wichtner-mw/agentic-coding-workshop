@echo off
echo ===================================
echo Game Results Platform - Local Setup
echo ===================================

echo.
echo Checking if MongoDB is installed...

where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ MongoDB is not installed.
    echo.
    echo 📋 Installation Options:
    echo.
    echo 1. Install MongoDB Community Edition:
    echo    Download from: https://www.mongodb.com/try/download/community
    echo.
    echo 2. Or use Docker (recommended):
    echo    docker run -d -p 27017:27017 --name mongodb mongo:6.0
    echo.
    echo 3. Or use npm script:
    echo    npm run docker:dev
    echo.
    pause
    exit /b 1
)

echo ✅ MongoDB found!

echo.
echo Starting MongoDB...
echo.

mkdir "%~dp0data\db" 2>nul
mkdir "%~dp0data\log" 2>nul

start /B mongod --dbpath "%~dp0data\db" --logpath "%~dp0data\log\mongo.log" --fork

timeout /t 3 /nobreak >nul

echo.
echo ✅ MongoDB started!
echo.
echo 🌐 MongoDB is running on: localhost:27017
echo 📁 Data directory: %~dp0data\db
echo 📄 Log file: %~dp0data\log\mongo.log
echo.
echo 🚀 Start your application:
echo    npm run dev
echo.
echo 💾 Your data will persist in the data\db folder
echo 🛑 To stop MongoDB: Ctrl+C or close the terminal
echo.
pause