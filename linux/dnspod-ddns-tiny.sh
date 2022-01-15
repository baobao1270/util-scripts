#!/bin/bash

DP_ID="<id>"
DP_TOKEN="<token>"
IP_CHKURL="https://ncsi.josephcz.xyz/ip.php" # The website that can return a IP address in text/plain
HOST="@"            # subdomain
ZONE="example.com"  # domian
TYPE="A"          # only A record supportted

function urlencode() {
        out=""
        while read -n1 c
        do
                case ${c} in
                        [a-zA-Z0-9._-]) out="$out$c" ;;
                        *) out="$out`printf '%%%02X' "'$c"`" ;;
                esac
        done
        echo -n ${out}
}

function techo() {
        echo $(date "+[%Y-%m-%d %H:%M:%S %Z]") $*
}

techo "Update $HOST.$ZONE"
techo "REQUEST $IP_CHKURL"
ip=$(curl -s -k $IP_CHKURL)
techo "Current IP: $ip"

auth_str="login_token=$DP_ID,$DP_TOKEN"
auth_log="login_token=******,*********"
public_params="format=json&domain=$ZONE&sub_domain=$HOST"
techo "REQUEST https://dnsapi.cn/Record.List?$auth_log&$public_params&record_type=$TYPE"
res=$(curl -s -X POST https://dnsapi.cn/Record.List -d "$auth_str&$public_params&record_type=$TYPE")
err=$(echo ${res#*code} | cut -d'"' -f3)
if [ "$err" != "1" ]; then
	techo "API Error: $res"
	exit
fi
remote_ip=$(echo ${res#*value} | cut -d'"' -f3)
techo "Remote IP: $remote_ip"
if [ "$ip" == "$remote_ip" ]; then
	techo "Need not update, bye"
	exit
fi

record_id=$(echo ${res#*\"records\"\:\[\{\"id\"} | cut -d'"' -f2)
record_line=$(echo ${res#*line_id} | cut -d'"' -f3)
techo "Record ID: $record_id"
techo "Record Line: $record_line"
techo "Updating DDNS: $HOST.$ZONE"

techo "REQUEST https://dnsapi.cn/Record.Ddns?$auth_log&$public_params&record_id=$record_id&record_line_id=$record_line&value=$ip"
res=$(curl -s -X POST https://dnsapi.cn/Record.Ddns -d "$auth_str&$public_params&record_id=$record_id&record_line_id=$record_line&value=$ip")
err=$(echo ${res#*code} | cut -d'"' -f3)
if [ "$err" != "1" ]; then
	techo "API Error: $res"
	exit
fi
result="$(echo ${res#*message\"}|cut -d'"' -f2)"
techo "Update result: $result"
techo "Update Success."
