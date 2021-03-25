import requests
import smtplib
import time
import os
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr

"""
This script is write for OpenWrt x86.

crontab settings: (run at 15:00 everyday)
00 15 * * * /usr/bin/python /root/usts-elec2email.py > /dev/null
or
00 15 * * * /usr/bin/python /root/usts-elec2email.py > /var/usts-elec2email.log

System available from 8:00 to 22:00, other time will return 403.
Electricity usage status updates one time everyday noon.
"""

room   = "15-101" # Room id, "XX-XXX", e.g. "15-101"
price  = 0.54     # Electricity Price, CNY/kWh, it is a "magic number" so don't change it.
mail_from = "electricy-admin@example.com"
mail_to   = "somestudent@post.usts.edu"
smtp_host = "smtp.example.com"
smtp_user = mail_from
smtp_pass = "P@ssw0rd!" # this is an example password.


r = requests.get("http://ecardwx.usts.edu.cn/net-h5/api/d3schele/apiele.ashx?action=105001&adapterid=3&bind_type=3&xiaoqu_id=2&loudong_id=341")

data = None

for i in r.json()["DATA"]:
    if i["ROOM"] == room:
        data = i
        break

if data == None:
    print("Room data not found.")
    os._exit(-1)

data["ELEC_PRICE"] = price
data["ELEC_LEFT"]  = data["ELEC_BUY"] - data["ELEC_USED"]
data["ELEC_BUY"]   = round(data["ELEC_BUY"]  * price, 2)
data["ELEC_USED"]  = round(data["ELEC_USED"]  * price, 2)
data["ELEC_LEFT"]  = round(data["ELEC_LEFT"]  * price, 2)
data["ELEC_AMOUNT_BUY"]  = round(data["ELEC_BUY"]  / price, 2)
data["ELEC_AMOUNT_USED"] = round(data["ELEC_USED"] / price, 2)
data["ELEC_AMOUNT_LEFT"] = round(data["ELEC_LEFT"] / price, 2)

html = """
<div align="center" width="600px" style="min-width: 600px;" valign="center">
    <h1>Today Electricity Bill of Room {ROOM}</h1>
    <table border="1" cellspacing="0" style="border-collapse:collapse">
        <tbody>
            <tr>
                <td width="100px"><b>房间名称</b></td>
                <td width="150px">{ROOM}</td>
                <td width="100px"><b>执行电价</b></td>
                <td width="150px">{ELEC_PRICE} 元/度</td>
            </tr>
            <tr>
                <td><b>剩余电量</b></td>
                <td>{ELEC_AMOUNT_LEFT} 度</td>
                <td><b>电费余额</b></td>
                <td>{ELEC_LEFT} 元</td>
            </tr>
            <tr>
                <td><b>已用电量</b></td>
                <td>{ELEC_AMOUNT_USED} 度</td>
                <td><b>已用金额</b></td>
                <td>{ELEC_USED} 元</td>
            </tr>
            <tr>
                <td><b>已购电量</b></td>
                <td>{ELEC_AMOUNT_BUY} 度</td>
                <td><b>已购金额</b></td>
                <td>{ELEC_BUY} 元</td>
            </tr>
        </tbody>
    </table>
</div>
""".format(**data)

message = MIMEText(html, "html", "utf-8")
message["Subject"] = Header("您 {0} 房间的电费账单账单 ({1}) #{2}".format(room, time.strftime("%Y-%m-%d"), time.time_ns()), "utf-8")
message["From"] = formataddr([Header("苏科大电费通知助手", "utf-8").encode(), mail_from])
message["To"] = formataddr([Header("您", "utf-8").encode(), mail_to])

try:
    server = smtplib.SMTP_SSL(smtp_host, 465)
    server.set_debuglevel(1)
    server.login(smtp_user, smtp_pass)
    server.sendmail(mail_from, mail_to, message.as_string())
    server.quit()
    print("Mail send success.")
except smtplib.SMTPException as e:
    print('Mail send error:', e)
