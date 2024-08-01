#!/bin/bash
# cfzinit.sh - v1.0.0
# Copyight (c) 2024 Joseph Chris <joseph@josephcz.xyz> under MIT License
#
# Clondflare Zone Initialization Script
#

# Basic Settings
EMAIL=
KEY=
DOMAIN=

# DNS::DNSSEC
# Default: true
DNSSEC=true

# TLS::Origin Mode
# Default: strict
# Values: flexible | full | strict
TLS=strict

# TLS::Recommender
# Default: true
TLS_RECOMMENDER=true

# TLS::CA
TLS_CA=google

# TLS::Redirect ("Always use HTTPS" + "Automatic HTTPS Rewrites")
# Default: true
TLS_REDIRECT=true

# TLS::HSTS
# Default: true
TLS_HSTS=true
# Default: true
TLS_HSTS_SUBDOMAINS=true
# Default: 31536000 (1y)
# Examples: 31536000 (1y) | 604800 (1w) | 86400 (1d) | 0 (disabled)
TLS_HSTS_MAXAGE=31536000

# TLS::Preload
# Default: 1.2
TLS_VER_MIN="1.2"

# TLS::Oppurtunistic Encryption [Security Issues]
# Default: false
TLS_OE=false

# TLS::TLS 1.3
# Default: true
TLS_13=true

# WAF::Security Level
# Default: essentially_off
# Values: essentially_off | low | medium | high | under_attack
WAF_LEVEL=essentially_off

## WAF::Challenge Passage
# Default: 31536000
# Examples: 31536000 (1y) | 604800 (1w) | 86400 (1d) | 0 (disabled)
WAF_CHALLENGE_AGE=31536000

# WAF::Browser Integrity Check
# Default: false
WAF_BROWSER_INTEGRITY=false

# Cache::Brotli
# Default: true
CACHE_BROTLI=true

# Cache::Early Hints [Security Issues]
# Default: false
CACHE_EARLY_HINTS=false

# Cache::Rocket Loader (JavaScript Used)
# Default: false
CACHE_ROCKET=false

# Cache::Auto Minify
# Default: true
CACHE_MINIFY_HTML=true
CACHE_MINIFY_CSS=true
CACHE_MINIFY_JS=true

# Cache::HTTP/2 to Origin
# Default: true
NET_H2=true

# Cache::HTTP/3 (with QUIC) (May have issues in China)
# Default: false
NET_H3=false

# Cache::0-RTT Connection Resumption
# Default: true
NET_0RTT=true

# Cache::Cache Level (Query String)
# Default: aggressive
# Values: basic      (No Query String:      Only delivers files from cache when there is no query string)
#         aggressive (Standard:             Delivers a different resource each time the query string changes)
#         simplified (Ignore Query String:  Delivers the same resource to everyone regardless of the query string)
CACHE_QUERYSTRING=aggressive

# Cache::Browser Cache TTL
# Default: 0 (respect origin headers)
# Examples: 31536000 (1y) | 604800 (1w) | 86400 (1d) | 0 (respect origin headers)
CACHE_TTL=0

# Cache::Always Online [Privacy Issues]
# Default: false
CACHE_ALWAYS_ONLINE=false

# Network::WebSockets
# Default: true
NETWORK_WS=true

# Network::Pseudo IPv4
# Default: false
NETWORK_PSEUDO_IPV4=false

# Network::IP Geolocation
# Default: true
NETWORK_GEO=true

# Network::Network Error Logging [Privacy Issues]
# Default: false
NETWORK_NEL=false

# Network::Onion Routing [Privacy Issues]
# Default: false
NETWORK_ONION=false


###########################################################
# END OF CONFIGURATION
###########################################################
echo -e "\n"
CURL_OPTS="-sSf"
CURL_OPTS+=" -H Content-Type:application/json"
CURL_OPTS+=" -H X-Auth-Email:$EMAIL"
CURL_OPTS+=" -H X-Auth-Key:$KEY"

echo -e "\033[01;33mGetting Zone ID for '$DOMAIN'...\033[0m"
RESPONSE=$(curl $CURL_OPTS -X GET https://api.cloudflare.com/client/v4/zones?name=$DOMAIN)
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error getting Zone ID \033[0m"; exit 1; fi
ZONE_ID=$(echo $RESPONSE | jq -r '.result[0].id')
echo -e "\033[01;32mZone ID: \033[04m$ZONE_ID\033[0m"
if [ -z "$ZONE_ID" ]; then
  echo -e "\033[01;37;41m Zone ID not found. Exit! \033[0m"
  exit 1
fi
ACCOUNT_ID=$(echo $RESPONSE | jq -r '.result[0].account.id')
echo -e "\033[01;32mAccount ID: \033[04m$ACCOUNT_ID\033[0m"
if [ -z "$ACCOUNT_ID" ]; then
  echo -e "\033[01;37;41m Account ID not found. Exit! \033[0m"
  exit 1
fi
echo -e "\n"

[ $DNSSEC = "true" ] && DNSSEC="active" || DNSSEC="disabled"
echo -e "\033[01;33mSetting DNSSEC to '$DNSSEC'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dnssec \
    -d '{"status":"'$DNSSEC'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting DNSSEC \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;31mDisabling Universal SSL...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/ssl/universal/settings \
    -d '{"enabled":false}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error disabling Universal SSL \033[0m"; exit 1; fi
echo -e "\n"
echo -e "\033[01;37;43mWaiting 10 seconds for SSL to be disabled...\033[0m"
for i in {1..10}; do
  echo -en "\033[01;32m$i \033[0m\r"
  sleep 1
done
echo -e "\n"

echo -e "\033[01;32mRe-enabling Universal SSL...\033[0m"
curl $CURL_OPTS -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/ssl/universal/settings" \
     -d '{"enabled":true,"certificate_authority":"'$TLS_CA'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error re-enabling Universal SSL \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting TLS Origin Mode to '$TLS'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl \
    -d '{"value":"'$TLS'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting TLS Origin Mode \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting TLS Recommender to '$TLS_RECOMMENDER'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl_recommender \
    -d '{"enabled":'$TLS_RECOMMENDER'}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting TLS Recommender \033[0m"; exit 1; fi
echo -e "\n"

[ $TLS_REDIRECT = "true" ] && ALWAYS_USE_HTTPS="on" || ALWAYS_USE_HTTPS="off"
echo -e "\033[01;33mSetting Always Use HTTPS to '$ALWAYS_USE_HTTPS'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/always_use_https \
    -d '{"value":"'$ALWAYS_USE_HTTPS'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Always Use HTTPS \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting HSTS to '$TLS_HSTS' (Max-Age: $TLS_HSTS_MAXAGE, Include Subdomains: $TLS_HSTS_SUBDOMAINS)...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_header \
    -d '{"value":{"strict_transport_security":{"enabled":'$TLS_HSTS',"max_age":'$TLS_HSTS_MAXAGE',"include_subdomains":'$TLS_HSTS_SUBDOMAINS'}}}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting HSTS \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting TLS Minimum Version to '$TLS_VER_MIN'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/min_tls_version \
    -d '{"value":"'$TLS_VER_MIN'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting TLS Minimum Version \033[0m"; exit 1; fi
echo -e "\n"

[ $TLS_OE = "true" ] && TLS_OE="on" || TLS_OE="off"
echo -e "\033[01;33mSetting Opportunistic Encryption to '$TLS_OE'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/opportunistic_encryption \
    -d '{"value":"'$TLS_OE'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Opportunistic Encryption \033[0m"; exit 1; fi
echo -e "\n"

[ $TLS_13 = "true" ] && TLS_13="on" || TLS_13="off"
echo -e "\033[01;33mSetting TLS 1.3 to '$TLS_13'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/tls_1_3 \
    -d '{"value":"'$TLS_13'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting TLS 1.3 \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting Automatic HTTPS Rewrites to '$ALWAYS_USE_HTTPS'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/automatic_https_rewrites \
    -d '{"value":"'$ALWAYS_USE_HTTPS'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Automatic HTTPS Rewrites \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting WAF Security Level to '$WAF_LEVEL'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level \
    -d '{"value":"'$WAF_LEVEL'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting WAF Security Level \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting WAF Challenge Passage to '$WAF_CHALLENGE_AGE'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/challenge_ttl \
    -d '{"value":'$WAF_CHALLENGE_AGE'}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting WAF Challenge Passage \033[0m"; exit 1; fi
echo -e "\n"

[ $WAF_BROWSER_INTEGRITY = "true" ] && WAF_BROWSER_INTEGRITY="on" || WAF_BROWSER_INTEGRITY="off"
echo -e "\033[01;33mSetting Browser Integrity Check to '$WAF_BROWSER_INTEGRITY'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/browser_check \
    -d '{"value":"'$WAF_BROWSER_INTEGRITY'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Browser Integrity Check \033[0m"; exit 1; fi
echo -e "\n"

[ $CACHE_BROTLI = "true" ] && CACHE_BROTLI="on" || CACHE_BROTLI="off"
echo -e "\033[01;33mSetting Brotli to '$CACHE_BROTLI'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/brotli \
    -d '{"value":"'$CACHE_BROTLI'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Brotli \033[0m"; exit 1; fi
echo -e "\n"

[ $CACHE_EARLY_HINTS = "true" ] && CACHE_EARLY_HINTS="on" || CACHE_EARLY_HINTS="off"
echo -e "\033[01;33mSetting Early Hints to '$CACHE_EARLY_HINTS'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/early_hints \
    -d '{"value":"'$CACHE_EARLY_HINTS'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Early Hints \033[0m"; exit 1; fi
echo -e "\n"

[ $CACHE_ROCKET = "true" ] && CACHE_ROCKET="on" || CACHE_ROCKET="off"
echo -e "\033[01;33mSetting Rocket Loader to '$CACHE_ROCKET'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/rocket_loader \
    -d '{"value":"'$CACHE_ROCKET'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Rocket Loader \033[0m"; exit 1; fi
echo -e "\n"


[ $CACHE_MINIFY_HTML = "true" ] && CACHE_MINIFY_HTML="on" || CACHE_MINIFY_HTML="off"
[ $CACHE_MINIFY_CSS = "true" ] && CACHE_MINIFY_CSS="on" || CACHE_MINIFY_CSS="off"
[ $CACHE_MINIFY_JS = "true" ] && CACHE_MINIFY_JS="on" || CACHE_MINIFY_JS="off"
echo -e "\033[01;33mSetting Auto Minify to HTML: '$CACHE_MINIFY_HTML', CSS: '$CACHE_MINIFY_CSS', JS: '$CACHE_MINIFY_JS'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/minify \
    -d '{"value":{"html":"'$CACHE_MINIFY_HTML'","css":"'$CACHE_MINIFY_CSS'","js":"'$CACHE_MINIFY_JS'"}}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Auto Minify \033[0m"; exit 1; fi
echo -e "\n"

[ $NET_H2 = "true" ] && MAX_ORIGIN_HTTP=2 || MAX_ORIGIN_HTTP=1
echo -e "\033[01;33mSetting Maximum Origin HTTP Version to '$MAX_ORIGIN_HTTP'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/origin_max_http_version \
    -d '{"value":"'$MAX_ORIGIN_HTTP'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Maximum Origin HTTP Version \033[0m"; exit 1; fi
echo -e "\n"

[ $NET_H3 = "true" ] && NET_H3="on" || NET_H3="off"
echo -e "\033[01;33mSetting HTTP/3 to '$NET_H3'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/http3 \
    -d '{"value":"'$NET_H3'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting HTTP/3 \033[0m"; exit 1; fi
echo -e "\n"

[ $NET_0RTT = "true" ] && NET_0RTT="on" || NET_0RTT="off"
echo -e "\033[01;33mSetting 0-RTT Connection Resumption to '$NET_0RTT'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/0rtt \
    -d '{"value":"'$NET_0RTT'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting 0-RTT Connection Resumption \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting Cache Level (Query String) to '$CACHE_QUERYSTRING'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/cache_level \
    -d '{"value":"'$CACHE_QUERYSTRING'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Cache Level (Query String) \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting Browser Cache TTL to '$CACHE_TTL'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/browser_cache_ttl \
    -d '{"value":'$CACHE_TTL'}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Browser Cache TTL \033[0m"; exit 1; fi
echo -e "\n"

[ $CACHE_ALWAYS_ONLINE = "true" ] && CACHE_ALWAYS_ONLINE="on" || CACHE_ALWAYS_ONLINE="off"
echo -e "\033[01;33mSetting Always Online to '$CACHE_ALWAYS_ONLINE'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/always_online \
    -d '{"value":"'$CACHE_ALWAYS_ONLINE'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Always Online \033[0m"; exit 1; fi
echo -e "\n"

[ $NETWORK_WS = "true" ] && NETWORK_WS="on" || NETWORK_WS="off"
echo -e "\033[01;33mSetting WebSockets to '$NETWORK_WS'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/websockets \
    -d '{"value":"'$NETWORK_WS'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting WebSockets \033[0m"; exit 1; fi
echo -e "\n"

[ $NETWORK_PSEUDO_IPV4 = "true" ] && NETWORK_PSEUDO_IPV4="on" || NETWORK_PSEUDO_IPV4="off"
echo -e "\033[01;33mSetting Pseudo IPv4 to '$NETWORK_PSEUDO_IPV4'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/pseudo_ipv4 \
    -d '{"value":"'$NETWORK_PSEUDO_IPV4'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Pseudo IPv4 \033[0m"; exit 1; fi
echo -e "\n"

[ $NETWORK_GEO = "true" ] && NETWORK_GEO="on" || NETWORK_GEO="off"
echo -e "\033[01;33mSetting IP Geolocation to '$NETWORK_GEO'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ip_geolocation \
    -d '{"value":"'$NETWORK_GEO'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting IP Geolocation \033[0m"; exit 1; fi
echo -e "\n"

echo -e "\033[01;33mSetting Network Error Logging to '$NETWORK_NEL'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/nel \
    -d '{"value": {"enabled": '$NETWORK_NEL'}}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Network Error Logging \033[0m"; exit 1; fi
echo -e "\n"

[ $NETWORK_ONION = "true" ] && NETWORK_ONION="on" || NETWORK_ONION="off"
echo -e "\033[01;33mSetting Onion Routing to '$NETWORK_ONION'...\033[0m"
curl $CURL_OPTS -X PATCH https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/opportunistic_onion \
    -d '{"value":"'$NETWORK_ONION'"}'
if [ $? -ne 0 ]; then echo -e "\033[01;37;41m Error setting Onion Routing \033[0m"; exit 1; fi
echo -e "\n"

echo -e "Finished."
echo -e "You need to enable CT monitoring manually at:"
echo -e "\t\033[01;32;04mhttps://dash.cloudflare.com/$ACCOUNT_ID/$DOMAIN/ssl-tls/edge-certificates\033[0m"
echo -e "You can also enable gRPC manually at:"
echo -e "\t\033[01;32;04mhttps://dash.cloudflare.com/$ACCOUNT_ID/$DOMAIN/network\033[0m"
