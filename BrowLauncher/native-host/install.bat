@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ========================================
echo   App Launcher - Native Host 安装程序
echo ========================================
echo.

:: 获取当前目录
set "CURRENT_DIR=%~dp0"
set "CURRENT_DIR=%CURRENT_DIR:~0,-1%"

:: 设置路径
set "HOST_PATH=%CURRENT_DIR%\host.py"
set "MANIFEST_CHROME=%CURRENT_DIR%\com.applauncher.host-chrome.json"
set "MANIFEST_FIREFOX=%CURRENT_DIR%\com.applauncher.host-firefox.json"
set "BAT_PATH=%CURRENT_DIR%\run_host.bat"

:: 检查 Python
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python 3.x
    pause
    exit /b 1
)

:: 获取 Python 路径
for /f "delims=" %%i in ('where python') do set "PYTHON_PATH=%%i" & goto :found_python
:found_python
echo [信息] Python 路径: %PYTHON_PATH%

:: 创建启动批处理
echo @echo off > "%BAT_PATH%"
echo "%PYTHON_PATH%" "%HOST_PATH%" >> "%BAT_PATH%"

echo.
echo 请选择要安装的浏览器:
echo   1. Chrome/Edge (Chromium内核)
echo   2. Firefox
echo   3. 全部安装
echo.
set /p "BROWSER_CHOICE=请输入选项 (1/2/3): "

set "BAT_PATH_ESCAPED=%BAT_PATH:\=\\%"

:: Chrome/Edge 安装
if "%BROWSER_CHOICE%"=="1" goto :install_chrome
if "%BROWSER_CHOICE%"=="3" goto :install_chrome
goto :check_firefox

:install_chrome
echo.
echo [Chrome/Edge 安装]
echo 请按照以下步骤获取扩展ID:
echo   1. 打开 Chrome/Edge，进入扩展管理页面
echo      Chrome: chrome://extensions/
echo      Edge: edge://extensions/
echo   2. 开启"开发者模式"
echo   3. 点击"加载已解压的扩展程序"
echo   4. 选择 extension 文件夹 (不是 AppLauncher 文件夹!)
echo   5. 复制显示的扩展ID（32位字母字符串）
echo.
set /p "EXT_ID=请输入扩展ID: "

if "%EXT_ID%"=="" (
    echo [错误] 扩展ID不能为空
    pause
    exit /b 1
)

:: 创建 Chrome manifest
echo {> "%MANIFEST_CHROME%"
echo   "name": "com.applauncher.host",>> "%MANIFEST_CHROME%"
echo   "description": "App Launcher Native Messaging Host",>> "%MANIFEST_CHROME%"
echo   "path": "%BAT_PATH_ESCAPED%",>> "%MANIFEST_CHROME%"
echo   "type": "stdio",>> "%MANIFEST_CHROME%"
echo   "allowed_origins": [>> "%MANIFEST_CHROME%"
echo     "chrome-extension://%EXT_ID%/">> "%MANIFEST_CHROME%"
echo   ]>> "%MANIFEST_CHROME%"
echo }>> "%MANIFEST_CHROME%"

:: 注册到注册表 (Chrome)
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.applauncher.host" /ve /t REG_SZ /d "%MANIFEST_CHROME%" /f >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [成功] Chrome 注册表项已添加
) else (
    echo [警告] Chrome 注册表项添加失败
)

:: 注册到注册表 (Edge)
reg add "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.applauncher.host" /ve /t REG_SZ /d "%MANIFEST_CHROME%" /f >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [成功] Edge 注册表项已添加
) else (
    echo [警告] Edge 注册表项添加失败
)

:check_firefox
if "%BROWSER_CHOICE%"=="2" goto :install_firefox
if "%BROWSER_CHOICE%"=="3" goto :install_firefox
goto :done

:install_firefox
echo.
echo [Firefox 安装]

:: 创建 Firefox manifest
echo {> "%MANIFEST_FIREFOX%"
echo   "name": "com.applauncher.host",>> "%MANIFEST_FIREFOX%"
echo   "description": "App Launcher Native Messaging Host",>> "%MANIFEST_FIREFOX%"
echo   "path": "%BAT_PATH_ESCAPED%",>> "%MANIFEST_FIREFOX%"
echo   "type": "stdio",>> "%MANIFEST_FIREFOX%"
echo   "allowed_extensions": [>> "%MANIFEST_FIREFOX%"
echo     "applauncher@example.com">> "%MANIFEST_FIREFOX%"
echo   ]>> "%MANIFEST_FIREFOX%"
echo }>> "%MANIFEST_FIREFOX%"

:: 注册到注册表 (Firefox)
reg add "HKCU\Software\Mozilla\NativeMessagingHosts\com.applauncher.host" /ve /t REG_SZ /d "%MANIFEST_FIREFOX%" /f >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [成功] Firefox 注册表项已添加
) else (
    echo [警告] Firefox 注册表项添加失败
)

:done
echo.
echo ========================================
echo   安装完成！
echo ========================================
echo.
echo 重要提示:
echo   - Chrome/Edge 请加载 extension 文件夹
echo   - Firefox 请加载 extension-firefox 文件夹
echo   - 安装后请重启浏览器
echo.
pause