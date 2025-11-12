@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@echo off

set WRAPPER_JAR="%~dp0\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
set MAVEN_JAVA_EXE="%JAVA_HOME%\bin\java.exe"

if not exist %MAVEN_JAVA_EXE% (
    if not "%JAVA_HOME%"=="" goto OkJHome
    echo.
    echo Error: JAVA_HOME not set and java.exe not in PATH
    echo.
    set MAVEN_JAVA_EXE=java.exe
)

:OkJHome
%MAVEN_JAVA_EXE% ^
  -classpath %WRAPPER_JAR% ^
  "-Dmaven.multiModuleProjectDirectory=%~dp0" ^
  %WRAPPER_LAUNCHER% %*
