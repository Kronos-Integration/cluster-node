
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
}
