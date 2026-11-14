@echo off
setlocal
set BASE_DIR=%~dp0
set WRAPPER_JAR=%BASE_DIR%\.mvn\wrapper\maven-wrapper.jar
if not exist "%WRAPPER_JAR%" (
  if not exist "%BASE_DIR%\.mvn\wrapper" mkdir "%BASE_DIR%\.mvn\wrapper"
  powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar' -OutFile '%WRAPPER_JAR%'"
  if errorlevel 1 exit /b 1
)
java -Dmaven.multiModuleProjectDirectory="%BASE_DIR:~0,-1%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
endlocal
