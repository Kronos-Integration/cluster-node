
OWNER=admin
LAUNCH_CFG=/Library/LaunchDaemons/kronos.plist

su - $OWNER 'cd /Groups/services/kronos;git pull'
su - $OWNER 'cd /Groups/services/kronos;npm install'

launchctl unload $LAUNCH_CFG
launchctl load $LAUNCH_CFG
