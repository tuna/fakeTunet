#!/bin/bash
LANIF="wlan0"
WANIF="eth0"

iptables -F
iptables -t mangle -F
iptables -t nat -F
iptables -X OFFLINE
iptables -F OFFLINE

iptables -t mangle -A PREROUTING -i $LANIF -m set ! --match-set logged src -j MARK --set-mark 1
iptables -t mangle -A PREROUTING -i $LANIF -m set --match-set logged src -j MARK --set-mark 2

iptables -t nat -A POSTROUTING -o $WANIF -j MASQUERADE
iptables -t nat -A PREROUTING -p tcp -m tcp --dport 80 -i $LANIF -m mark --mark 0x01 -j DNAT --to 127.0.0.1:80
iptables -t nat -A PREROUTING -d 166.111.204.120 -i $LANIF -j DNAT --to 127.0.0.1


iptables -N OFFLINE
iptables -A OFFLINE -p udp -m udp --dport 53 -j RETURN
iptables -A OFFLINE -j DROP

iptables -P FORWARD DROP
iptables -A FORWARD -m mark --mark 0x1 -i $LANIF -j OFFLINE
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -i $WANIF -j ACCEPT
iptables -A FORWARD -o $WANIF -j ACCEPT
