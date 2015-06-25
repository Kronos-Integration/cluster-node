OWNER=admin
LAUNCH_CFG=/Library/LaunchDaemons/kronos.plist

(
  cd /Groups/services/kronos
  su $OWNER -c 'git pull'
  su $OWNER -c 'npm install'
)

launchctl unload $LAUNCH_CFG
launchctl load $LAUNCH_CFG

