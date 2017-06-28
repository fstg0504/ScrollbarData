//�ļ�����Lib.js
//JsLib���������ͷ�ļ�
//���ߣ�LuoYingBin
if(!this.Lib){
    this.Lib={};
}
(function() {
    var allScripts = []; //�����ļ��������ڼ���ظ���
    Lib.include=function(path) {
        for (var i = 0; i < allScripts.length; i++) {
            if (path.toLowerCase() == allScripts[i].toLowerCase()) {
                return; //�����ظ�������
            }
        }
        allScripts.push(path);
        var fp = this.path + path;
        var vi = new Visitor(fp);
        vi.onOK = function(rv) {
            if (window.execScript) {
                window.execScript(rv);
            }
            else {
                window.eval(rv);
            }
        }
        vi.method = "get";
        vi.toJSON = false;
        vi.setDynamic(false);
        vi.Call();
    };

    Lib.GetFilePath=function(fn) {
        var path = "";
        var found = false;
        var scripts = document.getElementsByTagName("SCRIPT");
        for (var i = 0; i < scripts.length; i++) {
            var fullPath = scripts[i].src;
            var index = fullPath.lastIndexOf("/");
            var fileName = fullPath.substr(index + 1);
            if (fileName.toLowerCase() == fn.toLowerCase()) {
                if (found) {
                    alert("���棺���ڴ����ж�ε���[" + fn + "],���п��ܵ��´���");
                }
                path = fullPath.substring(0, index + 1);
                found = true;
            }
        }
        if (!found) {
            alert("���棺�޷��ҵ��ļ�[" + fn + "]");
        }
        return path;
    };
    Lib.LoadScript=function(scr, language) {
        if (language == null) {
            language = "javascript";
        }
        var script = document.createElement("script");
        script.type = "text/" + language;
        script.language = language;
        script.onload = script.onreadystatechange = function() {
            if (!this.readyState //fireFox����readyState����
                || this.readyState == 'loaded' || this.readyState == 'complete') {//IE���ж�
                this.isLoaded = true;   //�����Ѽ��ر�־
                //Lib.Trying();
            }
        }
        script.src = scr;

        var head = document.getElementsByTagName("head")[0];
        head.appendChild(script);
        return script;
    };
    Lib.LinkCSS=function(url) {
        try {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = url;

            var head = document.getElementsByTagName("head")[0];
            head.appendChild(link);
            return link;
        }
        catch (err) {
            return null;
        }
    };

    Lib.GetLibPath=function() {
        if (this.path == null) {
            this.path = Lib.GetFilePath("Lib.js");
        }
        return this.path;
    };
    Lib.AttachEvent=function(dom, eventName, fun) {
        if (this.isIE) {
            dom.attachEvent("on" + eventName, fun);
        }
        else {
            dom.addEventListener(eventName, fun, false);
        }
    };
    Lib.DetatchEvent=function(dom, eventName, fun) {
        if (this.isIE) {
            dom.detachEvent("on" + eventName, fun);
        }
        else {
            dom.addEventListener(eventName, fun, false);
        }
    };

    Lib.path=Lib.GetFilePath("Lib.js");
    Lib.isIE=(navigator.userAgent.indexOf("MSIE") > 0);
    Lib.main=function() {if (window.main) main();};
})();

Lib.AttachEvent(window, "load", function() {Lib.main();});
function include(path) {
    Lib.include(path);
}

/*----------------begin.Ajax���ܶ���---------------*/
function Visitor(svrUrl) {
    this.svrUrl = svrUrl;   //����ҳ���ַ
    this.dynamic = true;    //Ĭ��Ϊ�첽����
    this.toJSON = true;     //�Ƿ񽫽��ת����JSON����
    this.params = [];   //��������
    this.method = "POST";   //���ʷ���
    this.headerName = "Content-Type";
    this.headerValue = "application/x-www-form-urlencoded";
}
Visitor.prototype = (function() {
    //XmlHttpRequest�����÷���
    function GetHttpRequest() {
        var xmlHttp = false;
        /*@cc_on@*/
        /*@if (@_jscript_version >= 5)
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e2) {
                xmlHttp = false;
            }
        }
        @end@*/
        if (!xmlHttp && typeof XMLHttpRequest != 'undefined') {
            xmlHttp = new XMLHttpRequest();
        }
        return xmlHttp;
    }
    function OnAction() {
        if (this.xmlHttp.readyState == 4) { //ҳ�淵������
            if (this.xmlHttp.status == 200) {//ҳ����ȷִ��
                var returnValue = "";
                try {
                    // JSON���ݸ�ʽת��
                    if (this.toJSON) {
                        eval("returnValue=" + this.xmlHttp.responseText + ";");
                    }
                    else {
                        returnValue = this.xmlHttp.responseText;
                    }
                }
                catch (err) {
                    alert("���ִ��󣬿���ԭ��ΪJSON��ʽ���ִ���!");
                    returnValue = this.xmlHttp.responseText;
                }
                this.onOK(returnValue);
            }
            else {  //����ҳ��ִ���쳣
                this.onFailed(this.xmlHttp.responseText);
            }
        }
    }
    function setDynamic(isDynamic) {
        this.dynamic = isDynamic;
    }
    //��Ӳ���
    function AddParams(key, value) {
        //�Բ������б���ת������
        //ע�����ڲ�ͬ�ķ��񣬱���PHP��JSP�ȣ�����ת�������п��ܲ�ͬ������в�����ȷ��
        this.params.push(key + "=" + encodeURIComponent(value));
    }
    function Send(data) {
        try {
            this.xmlHttp = GetHttpRequest(); //����xmlHttp����
            this.xmlHttp.open(this.method, this.svrUrl, this.dynamic);
            this.xmlHttp.setRequestHeader(this.headerName, this.headerValue);
            if (this.dynamic) { //�첽����
                var _this = this;
                this.xmlHttp.onreadystatechange = function() {
                    OnAction.call(_this);
                }
            }
            if (data == null) data = "";
            this.xmlHttp.send(data);
            if (!this.dynamic) {
                //firefoxͬ��������onreadystatechange���ڴ�ֱ�ӵ���
                OnAction.call(this);
            }
        }
        catch (err) {
            alert(err.description);
        }
    }
    function SendJSON(json){
        this.Send(JSON.toBeanArg(json));
    }
    //����
    function Call() {
        if (this.params.length > 0) {
            var ps = this.params.join("&");
            this.Send(ps);
            this.params = new Array();
        }
        else {
            this.Send();
        }
    }
    function setRequestHeader(hn, hv) {
        this.headerName = hn;
        this.headerValue = hv;
    }
    return {
        setDynamic: setDynamic,
        setRequestHeader: setRequestHeader,
        AddParams: AddParams,
        Send: Send,
        SendJSON:SendJSON,
        Call: Call,
        onOK: function(rv) { },
        onFailed: function(rv) {alert("�������");}
    };
})();
/*----------------end.Ajax���ܶ���---------------*/

/*----------------begin.������չ------------------*/
/*------���������Ƴ�һ��Ԫ��-------*/
Array.prototype.remove = function(obj) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === obj) {
            this.splice(i, 1);
            return;
        }
    }
}

/*-------�¼��󶨺�����չ--------*/
Function.prototype.CreateEventFun = function(caller) {
    var _this = this;
    function EF(evn) {
        if (evn == null) {
            evn = window.event;
        }
        if (evn.srcElement == null) {
            evn.srcElement = evn.target;
        }
        if (evn.x == null) {
            evn.x = evn.pageX;
            evn.y = evn.pageY;
        }
        if (caller != null) {
            _this.call(caller, evn);
        } else {
            _this(evn);
        }
    }
    return EF;
};

/*---��Ĭ��״̬չʾһ����ҳ�Ի��򣬼��㲻ͬ�汾IE֮��߶Ȳ���----*/
function ShowDialog(url, args, width, height, setting) {
    var defaultSetting = {
        dialogWidth: null,
        dialogHeight: null,
        dialogTop: null,
        dialogLeft: null,
        center: "yes",
        dialogHide: null,   //dialogHide
        help: "no",   //help
        resizable: "no", //resizable
        scroll: "no",   //scroll
        status: "no",   //status
        unadorned: null, //unadorned
        edge: null      //edge:{ sunken | raised }
    };
    if (setting != null) {
        for (var attr in setting) {
            defaultSetting[attr] = setting[attr];
        }
    }
    if (width != null) {
        defaultSetting.dialogWidth = width + "px";
    }
    if (height != null) {
        var info = Public.GetBroserInfo();
        if (info.name == "IE" && parseFloat(info.version) < 7) height = parseInt(height) + 55;
        defaultSetting.dialogHeight = height + "px";
    }
    var settingStr = "";
    var needSplit = false;
    for (var attr in defaultSetting) {
        if (needSplit)
            settingStr += ";";
        else
            needSplit = true;
        settingStr += attr + ":" + defaultSetting[attr];
    }
    var rv = window.showModalDialog(url, args, settingStr);
    return rv;
}

// ��$d() ��� $()��ȡһ��������Ϊ$()�Ὣ������չΪElement�࣬��ʱ�Ƚ϶�
function $d(id) {return (typeof (id) == "string" ? document.getElementById(id) : id);}

Date.prototype.FmtDate = function() {
    var year = this.getFullYear();
    var month = this.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = this.getDate();
    if (date < 10) date = "0" + date;
    return year + "-" + month + "-" + date;
}
Date.prototype.FmtTime = function() {
    var h = this.getHours();
    if (h < 10) h = "0" + h;
    var m = this.getMinutes();
    if (m < 10) m = "0" + m;
    var s = this.getSeconds();
    if (s < 10) s = "0" + s;
    return h + ":" + m + ":" + s;
}
Date.prototype.FmtDateTime = function() {
    return this.FmtDate() + " " + this.FmtTime();
}
if(!this.Public)
    this.Public={};
(function() {
    Public.FindChild=function(dom, id) {
        var node = dom.firstChild;
        while (node != null) {
            if (node.nodeType == 1 && node.id == id) {
                return node;
            }
            node = node.nextSibling;
        }
        node = dom.firstChild;
        while (node != null) {
            if (node.nodeType == 1) {
                var cn = Public.FindChild(node, id);
                if (cn != null) return cn;
            }
            node = node.nextSibling;
        }
        return null;
    }

    //��ȡ��������Ϣ
    Public.GetBroserInfo=function() {
        if (GetBroserInfo.Info != null) {
            return GetBroserInfo.Info;
        }
        var info = {name: "", version: "", toString: function() {return this.name + " " + this.version;}};

        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        if (window.ActiveXObject)
            Sys.ie = ua.match(/msie ([\d.]+)/)[1]
        else if (document.getBoxObjectFor)
            Sys.firefox = ua.match(/firefox\/([\d.]+)/)[1]
        else if (window.MessageEvent && !document.getBoxObjectFor)
            Sys.chrome = ua.match(/chrome\/([\d.]+)/)[1]
        else if (window.opera)
            Sys.opera = ua.match(/opera.([\d.]+)/)[1]
        else if (window.openDatabase)
            Sys.safari = ua.match(/version\/([\d.]+)/)[1];

        if (Sys.ie) {
            info.name = "IE";
            info.version = Sys.ie;
        }
        if (Sys.firefox) {
            info.name = "Firefox";
            info.version = Sys.firefox;
        }
        if (Sys.chrome) {
            info.name = "Chrome";
            info.version = Sys.chrome;
        }
        if (Sys.opera) {
            info.name = "Opera";
            info.version = Sys.opera;
        }
        if (Sys.safari) {
            info.name = "Safari";
            info.version = Sys.safari;
        }
        GetBroserInfo.Info = info;
        return info;
    }

    Public.OpenWin=function(url, target, features) {
        var sFeatures = features;
        if (sFeatures == null) {
            var h = screen.availHeight;
            var w = screen.availWidth;
            sFeatures = "location=no,menubar=no,toolbar=no,titlebar=no,status=no,resizable=yes,scrollbars=yes,left=0,top=0,width=" + w + ",height=" + h;
        }
        var win = window.open(url, target, sFeatures);
        return win;
    }
    Public.ShowDialog=ShowDialog;
})();

//JSON������
if (!this.JSON) {
    this.JSON = {};
}
(function () {
    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };
        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }
    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }

    JSON.encode = function(str) {
        return encodeURIComponent(str);
    };

    function Convert(json, name) {
        if (json == null) {
            return name + "=";
        }
        var cons = json.constructor;
        if (cons == String ||
            cons == Number) {
            return name + "=" + JSON.encode(json);
        }
        if (cons == Boolean) {
            return name + "=" + json;
        }
        if (cons == Array) {
            return ConvertArray(json, name);
        }
        if(cons==Object){
            return ConvertObject(json, name);
        }
        return name+"="+json.toString();
    }

    function ConvertObject(obj, name) {
        var args = [];
        for (var attr in obj) {
            var member = obj[attr];
            args.push(Convert(member, (name == null ? attr : name + "." + attr)));
        }
        return args.join("&");
    }

    function ConvertArray(arr, name) {
        var args = [];
        for (var i = 0; i < arr.length; i++) {
            var member = arr[i];
            var attr = "[" + i + "]";
            args.push(Convert(member, (name == null ? attr : name + attr)));
        }
        return args.join("&");
    }
    JSON.toBeanArg = function(json) {
        return ConvertObject(json);
    };

}());
/*----------------end.������չ------------------*/