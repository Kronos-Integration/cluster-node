[Unit]
Description={{description}}
After=network.target network-online.target

[Service]
Type=exec
ExecStart={{installdir}}/bin/{{name}}
TimeoutStartSec=20
StandardOutput=syslog
User={{name}}
Group={{name}}
PrivateTmp=true
NoNewPrivileges=true
RuntimeDirectory={{name}}
StateDirectory={{name}}
ConfigurationDirectory={{name}}

[Install]
WantedBy=multi-user.target
