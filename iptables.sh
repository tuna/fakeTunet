#!/bin/bash
LANIF="eth0"
WANIF="eth1"

iptables -t mangle -A PREROUTING -i $LANIF -m set ! --match-set logged src -j MARK --set-mark 1
iptables -t mangle -A PREROUTING -i $LANIF -m set --match-set logged src -j MARK --set-mark 2
iptables -t nat -A PREROUTING -p tcp -m multiport 80,443 -m mark --mark 0x1 -j DNAT --to-destination 101.5.42.1:80
iptables -t nat -A PREROUTING -d 166.111.204.120 -j DNAT --to-destination 101.5.42.1
iptables -t nat -A POSTROUTING -s 101.5.0.0/16 -m mark --mark 0x2 -j MASQURADE
