post_install() {
	systemctl daemon-reload
	systemctl enable cluster-node
	systemctl enable cluster-node.socket
	systemctl start cluster-node.socket
}

pre_upgrade() {
	systemctl stop cluster-node.socket
	systemctl stop cluster-node
}

post_upgrade() {
	systemctl daemon-reload
	systemctl start cluster-node.socket
}

pre_remove() {
	systemctl stop cluster-node.socket
	systemctl disable cluster-node.socket
	systemctl stop cluster-node
	systemctl disable cluster-node
}
