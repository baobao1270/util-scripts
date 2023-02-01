#!/bin/sh

ALI_AKID="<AccessKey ID>"
ALI_AKSC="<AccessKey Secret>"
IP_CHKURL="https://ncsi.josephcz.xyz/ip.php" # The website that can return a IP address in text/plain
RR="ddns"            # subdomain
ZONE="josephcz.xyz"  # domian
IP=$(curl -s -k $IP_CHKURL)
RR_ZONE=$RR.$ZONE    # the target domain, "ddns.josephcz.xyz"

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

techo "Updating Domain: $RR_ZONE"
techo "IP: $IP"
TIMESTAMP=`date -u "+%Y-%m-%dT%H%%3A%M%%3A%SZ"`
NONCE=$(cat /proc/sys/kernel/random/uuid | tr '[A-Z]' '[a-z]')
PARAMS="AccessKeyId=$ALI_AKID&Action=DescribeSubDomainRecords&Format=json&SignatureMethod=HMAC-SHA1&SignatureNonce=$NONCE&SignatureVersion=1.0&SubDomain=$RR_ZONE&Timestamp=$TIMESTAMP&Version=2015-01-09"
ALI_CQS="GET&%2F&"$(echo -n $PARAMS | urlencode)
SIGN=$(echo -ne "$ALI_CQS" | openssl dgst -sha1 -hmac "$ALI_AKSC&" -binary | base64)
SIGN=$(echo -n $SIGN | urlencode)
PARAMS=$PARAMS"&Signature="$SIGN
RES_JSON=$(curl -s -k "https://alidns.aliyuncs.com/?$PARAMS")
RECORD_ID=$(echo -n $RES_JSON | grep -Eo '"RecordId":"[0-9]+"' | cut -d':' -f2 | tr -d '"')
RECORD_IP=$(echo -n $RES_JSON | grep -Eo '"Value":"[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"' | cut -d':' -f2 | tr -d '"')
if [[ "$RECORD_ID" = "" ]]; then
        techo "Record ID is empty. Exit."
        exit 0
fi
techo "Record ID: $RECORD_ID"
techo "Record IP: $RECORD_IP"
if [[ "$IP" = "$RECORD_IP" ]]; then
        techo "IP Address not changed. Exit."
        exit 0
fi

TIMESTAMP=`date -u "+%Y-%m-%dT%H%%3A%M%%3A%SZ"`
NONCE=$(cat /proc/sys/kernel/random/uuid | tr '[A-Z]' '[a-z]')
PARAMS="AccessKeyId=$ALI_AKID&Action=UpdateDomainRecord&Format=json&RR=$RR&RecordId=$RECORD_ID&SignatureMethod=HMAC-SHA1&SignatureNonce=$NONCE&SignatureVersion=1.0&Timestamp=$TIMESTAMP&Type=A&Value=$IP&Version=2015-01-09"
ALI_CQS="GET&%2F&"$(echo -n $PARAMS | urlencode)
SIGN=$(echo -ne "$ALI_CQS" | openssl dgst -sha1 -hmac "$ALI_AKSC&" -binary | base64)
SIGN=$(echo -n $SIGN | urlencode)
PARAMS=$PARAMS"&Signature="$SIGN
RES_JSON=$(curl -s -k "https://alidns.aliyuncs.com/?$PARAMS")
RECORD_ID=$(echo -n $RES_JSON | grep -Eo '"RecordId":"[0-9]+"' | cut -d':' -f2 | tr -d '"')
if [[ "$RECORD_ID" = "" ]]; then
        techo "Update Fail. Exit."
        exit 0
fi
techo "Update Success."
