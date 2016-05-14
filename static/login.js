var redirect_url="";
window.onload=function()
{
	if(document.getElementById("message"))
	{
		if(typeof(message_data) != "undefined")
		{
			message_data.con = message_data.con.replace(/\\\"/ig, "");
			document.getElementById("message").innerHTML = message_data.con;
		}
		if(typeof(bulletin_data) != "undefined")
		{
			bulletin_data = bulletin_data.replace(/\\\"/ig, "");
			document.getElementById("message").innerHTML = bulletin_data;
		}
	}
	
	var u=document.location.search.substring(1);	
	
	var is_online=1;
	if(u!="")//解析URL
	{
		var arr1 = u.split("&");
		var i=0;
		for(i=0; i<arr1.length; i++)
		{
			if(arr1[i] == "")
				continue;
			var arr2 = arr1[i].split("=");
			if(arr2[0] == "wlanacname")
			{
				document.login_form.wlanacname.value=arr2[1];
			}
			else if(arr2[0] == "wlanuserip" || arr2[0] == "ip")
			{
				document.login_form.user_ip.value=arr2[1];
			}
			else if(arr2[0] == "ssid")
			{
				document.login_form.ssid.value=arr2[1];
			}
			else if(arr2[0] == "vlan")
			{
				document.login_form.vlan.value=arr2[1];
			}
			else if(arr2[0] == "portal_ip" || arr2[0] == "nas_ip")
			{
				document.login_form.nas_ip.value=arr2[1];
			}
			else if(arr2[0] == "client_id" || arr2[0] == "mac")
			{
				document.login_form.mac.value=arr2[1];
			}
			else if(arr2[0] == "wbaredirect" || arr2[0] == "userurl" || arr2[0] == "URL" || arr2[0] == "url")
			{
				//document.login_form.wbaredirect.value=arr2[1];
				redirect_url = arr2[1];
			}		
			else if(arr2[0] == "is_debug")
			{
				document.login_form.is_debug.value=arr2[1];
			}
			else if(arr2[0] == "ac_type")
			{
				document.login_form.ac_type.value=arr2[1];
			}
			else if(arr2[0] == "rad_type")
			{
				document.login_form.rad_type.value=arr2[1];
			}
			else if(arr2[0] == "local_auth")
			{
				document.login_form.local_auth.value=arr2[1];
			}
			else if(arr2[0] == "ac_id")
			{
				document.login_form.ac_id.value=arr2[1];
			}
			/*
			else if(arr2[0] == "vrf-id" || arr2[0] == "vrf_id")
			{
				document.login_form.vrf_id.value=arr2[1];
			}	
			*/
		}
	}
	
}
function get_err(res)
{
	var p=/E([\d]+)/;
	var arr = p.exec(res);
	var n=0;
	if(arr)
		n=Number(arr[1]);
	var msg=res;
	switch(n)
	{
	case 3001:
		msg="流量或时长已用尽";
		goto_service=1;
		break;
	case 3002:
		msg="计费策略条件不匹配";
		break;
	case 3003:
		msg="控制策略条件不匹配";
		break;
	case 3004:
		msg="余额不足";
		goto_service=1;
		break;
	case 2531:
		msg="用户不存在";
		break;
	case 2532:
		msg="两次认证的间隔太短";
		break;
	case 2533:
		msg="尝试次数过于频繁";
		break;
	case 2553:
		msg="密码错误";
		break;
	case 2601:
		msg="不是专用客户端";
		break;
	case 2606:
		msg="用户被禁用或无联网权限";
		break;
	case 2611:
		msg="MAC绑定错误";
		break;
	case 2613:
		msg="NAS PORT绑定错误";
		break;
	case 2616:
		msg="余额不足";
		goto_service=1;
		break;
	case 2620:
		msg="连接数已满，请登录http://usereg.tsinghua.edu.cn，选择下线您的IP地址。";
		goto_service=1;
		break;
	case 2806:
		msg="找不到符合条件的产品";
		break;
	case 2807:
		msg="找不到符合条件的计费策略";
		break;
	case 2808:
		msg="找不到符合条件的控制策略";
		break;
	case 2833:
		msg="IP地址异常，请重新拿地址";
		break;
	case 2840:
		msg="校内地址不允许访问外网";
		break;
	case 2841:
		msg="IP地址绑定错误";
		break;
	case 2842:
		msg="IP地址无需认证可直接上网";
		break;
	case 2843:
		msg="IP地址不在IP表中";
		break;
	case 2844:
		msg="IP地址在黑名单中，请联系管理员。";
		break;
	case 2901:
		msg="第三方接口认证失败";
		break;
	}
	return msg;			  
}

function do_login() { 	
    var uname = $('#uname').val();
    var pass = $('#pass').val();
	var ac_id = $('#ac_id').val();

    if (uname == '') {
        alert("请填写用户名");
        $('#uname').focus();
        return;
    }

    if (pass == '') {
        alert("请填写密码");
        $('#pass').focus();
        return;
    }
    
    var topost = "action=login&username=" + uname + "&ac_id="+ac_id;
	//alert(topost);
    //var res = post('/do_login.php', topost);
    $.post("/do_login.php", topost, function(res) {
   	if(res == "Login is successful.") {
            nav = navigator.userAgent.toLowerCase();
            var pp_nav = /safari/;
            var pp_mac = /mac/;
            if(pp_nav.test(nav) || (!pp_mac.test(nav))) {
            	if ($('#cookie')[0].checked) {
            	    $.cookie('tunet', uname + '\n' + pass,
            	        { expires: 365, path: '/' });
            	} else {
            	    $.cookie('tunet', null);
            	}
            }
			if (redirect_url) {
				var pp = /^http/;
				if(!pp.test(redirect_url)) {
					redirect_url = "http://"+redirect_url;
				}
				//setTimeout("location = redirect_url;", wireness == 'wired' ? 1000 : 3000);	
				setTimeout("location = redirect_url;", 1000);	
			} else {
				window.location="succeed.html";
			}
	} else if(res == "IP has been online, please logout.") {
            alert("您已在线了");
	} else {
            var msg111 = get_err(res);
                        if(msg111 == "用户被禁用或无联网权限")
                        {
                                alert(res+" or max_online_num=0" + "("+msg111+")")
                        }
                        else
                        {
                                alert(res+"("+msg111+")");
                        }
        }
    }); 
	return false;
}

function refreshLabel(e, f) {
    $('.placeholder[for=' + e.id + ']').css('display', (f || e.value) ? 'none' : 'inherit');
}

function addBookmark(name) {
    var name = name || 'TUNet 网页登录';
    var url = $.url().attr('source').replace(/\?.*$/, '');
    if (window.sidebar) { 
        window.sidebar.addPanel(name, url, ""); 
    } else if (document.all) {
        window.external.AddFavorite(url, name);
    } else if (window.opera && window.print) {
        return true;
    }
}

if (!$.url().param('noforward')) {
    $.post("/do_login.php", "action=check_online", function(data) {
        if (data == "online") {
            if (!$.url().param('nosucceed')) {
                location = dst || '/' + wireness + '/succeed.html?' + data;
            } else if (dst) {
                location = dst;
            }
        }
    });
}

$(document).ready(function() {
    var cookie = $.cookie('tunet');
    if (cookie) {
        var a = cookie.split('\n', 2);
        $('#uname').val(a[0]);
        $('#pass').val(a[1]);
        $('#cookie')[0].checked = true;
    }
    if ($('#msg').length) {
        $.get('/static/msg.txt', function(data) {
            $('#msg').text(data);
        })
    }

    $('#uname, #pass').bind('focusin focusout', function(ev) {
        refreshLabel(ev.target, ev.type == 'focusin');
    })
    refreshLabel($('#uname')[0]);
    refreshLabel($('#pass')[0]);
})

