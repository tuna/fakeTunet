#!/usr/bin/env python
import sqlite3
import sh
import re
from datetime import datetime
from flask import Flask, render_template, request, redirect, g

app = Flask(__name__)

DATABASE = "users.db"


class User(object):
    def __init__(self, ipaddr, username=None, login_time=None, logged_in=False):
        self.ipaddr = ipaddr
        self.username = username
        self.login_time = login_time
        self.logged_in = logged_in

    def __repr__(self):
        return "User(%s, %s)" % (self.ipaddr, self.username)


def connect_db():
    return sqlite3.connect(DATABASE)


@app.before_request
def before_request():
    g.db = connect_db()


@app.teardown_request
def teardown_request(*args):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()


def get_user(ip=None):
    ip = ip or request.remote_addr
    cur = g.db.execute(
        "SELECT ip,username,login_time,logged_in FROM users WHERE ip=?", [ip]
    )
    u = cur.fetchone()
    if u is None:
        g.db.execute(
            "INSERT INTO users (ip, username, login_time, logged_in) "
            "VALUES(?, ?, ?, ?)",
            [ip, "", "", False]
        )
        g.db.commit()
        u = (
            g.db
             .execute(
                 "SELECT ip,username,login_time,logged_in "
                 "FROM users WHERE ip=?", [ip])
             .fetchone()
        )
    return User(u[0], u[1], u[2], u[3])


def login_user(username, ip=None):
    ip = ip or request.remote_addr
    g.db.execute(
        "UPDATE users SET username=?, login_time=?, logged_in=1 WHERE ip=?",
        [
            username,
            datetime.now().strftime("%s"),
            ip,
        ]
    )
    g.db.commit()
    sh.ipset('add', 'logged', ip)


def logout_user(ip=None):
    ip = ip or request.remote_addr
    g.db.execute(
        "UPDATE users SET logged_in=0 WHERE ip=?", [ip]
    )
    g.db.commit()
    sh.ipset('del', 'logged', ip)


@app.route("/", defaults={'path': ''}, methods=['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS'])
@app.route("/<path:path>", methods=['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS'])
def redirection_page(path):
    user = get_user()
    if user.logged_in:
        return redirect("http://net.tsinghua.edu.cn/wireless/succeed.html")

    useragent = request.headers.get('User-Agent')
    host = request.headers.get("Host")
    if host not in ('localhost', 'net.tsinghua.edu.cn', 'localhost:5000', '166.111.204.120'):
        redir_url = "http://{}/{}".format(host, path)
        if re.findall(r'android|iphone|wap|windows phone|blackberry', useragent, re.I):
            return redirect(
                "http://net.tsinghua.edu.cn/wireless/phone.html?url=%s" % redir_url
            )
        return redirect("http://net.tsinghua.edu.cn/wireless/?url=%s" % redir_url)

    return redirect("http://net.tsinghua.edu.cn/wireless/")


@app.route("/wireless/")
def login_page():
    return render_template("wifi.html")


@app.route("/wireless/phone.html")
def phone_login_page():
    return render_template("phone.html")


@app.route("/wireless/succeed.html")
def login_succeed():
    return render_template("succeed.html")


@app.route("/rad_user_info.php", methods=["POST", "GET"])
def user_info():
    user = get_user()
    if user.logged_in:
        username = user.username
        ontime = user.login_time
        nowtime = datetime.now().strftime("%s")
        usage = str(5*1000*1000*1000)
        return ",".join(
            [username, ontime, nowtime, "0", "0", "0",
             usage, "0", user.ipaddr, "0", '', '0.003000', '0']
        )
    return ""


@app.route('/cgi-bin/srun_portal', methods=["POST"])
def srunportal():
    action = request.args.get("action")
    if action == "login":
        login_user(request.form.get("user_name"))
        return "Login is successful."
    else:
        logout_user()
        return "Logout is successful."


@app.route("/do_login.php", methods=["POST"])
def do_login():
    user = get_user()
    action = request.form.get("action")
    if action == "check_online":
        if user.logged_in:
            return "online"
        else:
            return "no"
    elif action == "login":
        login_user(request.form.get("username"))
        return "Login is successful."
    else:
        logout_user()
        return "Logout is successful."


@app.after_request
def set_header(resp):
    resp.headers["server"] = "Apache/2.4.12 (Unix) OpenSSL/1.0.1g-fips PHP/5.5.23"
    resp.headers["X-Powered-By"] = "PHP/5.5.23"
    return resp


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=8000)
    # app.run()

# vim: ts=4 sw=4 sts=4 expandtab
