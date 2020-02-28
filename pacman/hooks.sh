
pre_install() {
	useradd -U -l -M -r -s /usr/bin/nologin -d /var/lib/kronos-cluster-node -G http -c "kronos cluster node sample application" kronos-cluster-node
}

post_install() {
	systemctl daemon-reload
	systemctl enable kronos-cluster-node
	systemctl enable kronos-cluster-node.socket
	systemctl start kronos-cluster-node.socket
}

pre_upgrade() {
	systemctl stop kronos-cluster-node.socket
	systemctl stop kronos-cluster-node
}

post_upgrade() {
	systemctl daemon-reload
	systemctl start kronos-cluster-node.socket
}

pre_remove() {
	systemctl stop kronos-cluster-node.socket
	systemctl disable kronos-cluster-node.socket
	systemctl stop kronos-cluster-node
	systemctl disable kronos-cluster-node
}

post_remove() {
	systemctl daemon-reload
	userdel kronos-cluster-node
	groupdel kronos-cluster-node
}
