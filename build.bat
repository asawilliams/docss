@echo ON
set PATH=%PATH%;"C:\Program Files\nodejs\";%USERPROFILE%\AppData\Roaming\npm
echo killing off any previously hung node instances
taskkill /F /IM node.exe
npm cache clean -g && ^
npm cache clean && ^
npm install grunt-cli@0.1.7 -g && ^
npm prune && ^
npm install && ^
npm ls -g  && ^
npm ls && ^
grunt %~1