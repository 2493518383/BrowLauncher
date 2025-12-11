@echo off
chcp 65001 >nul

echo ========================================
echo   App Launcher - Native Host 卸载程序
echo ========================================
echo.

:: 删除 Chrome 注册表项
reg delete "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.applauncher.host" /f >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [成功] Chrome 注册表项已删除
) else (
    echo [信息] Chrome 注册表项不存在
)

:: 删除 Edge 注册表项
reg delete "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.applauncher.host" /f >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [成功] Edge 注册表项已删除
) else (
    echo [信息] Edge 注册表项不存在
)

:: 删除 Firefox 注册表项
reg delete "HKCU\Software\Mozilla\NativeMessagingHosts\com.applauncher.host" /f >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [成功] Firefox 注册表项已删除
) else (
    echo [信息] Firefox 注册表项不存在
)

echo.
echo 卸载完成！
echo.
pause