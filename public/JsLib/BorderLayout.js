/// <reference path="Lib.js" />

function BorderLayout(option) {
    this.rootDom = null;
    this.deep = 0;
    this.areaTop = null;
    this.areaLeft = null;
    this.areaCenter = null;
    this.areaRight = null;
    this.areaBottom = null;
    this.option = { top: null, left: null, right: null, bottom: null };
    
    if (option == null) return;
    for (var attr in option) {
        this.option[attr] = option[attr];
    }
}
BorderLayout.prototype = (function() {
    var layoutList = [];
    function GetDomDeep(dom) {
        var d = 0;
        var parent = dom.parentNode;
        while (parent != null) {
            d++;
            parent = parent.parentNode;
        };
        return d;
    }

    function RefreshAll() {
        for (var i = 0; i < layoutList.length; i++) {
            var layout = layoutList[i];
            layout.Refresh();
        }
    }

    Lib.AttachEvent(window, "resize", RefreshAll);
    Lib.AttachEvent(window, "load", RefreshAll);

    function ResetStyle(dom) {
        dom.style.borderStyle = "none";
        dom.style.boderWidth = "0px";
        dom.style.padding = "0px";
        dom.style.position = "absolute"; // "relative";
    }

    function Sort(l1, l2) {
        return l1.deep - l2.deep;
    }

    /****设置根节点*****/
    function BindDom(dom) {
        if (this.rootDom != null) return;
        if (typeof (dom) == "string") {
            dom = document.getElementById(dom);
        }
        this.rootDom = dom;
        dom.style.padding = "0px";
        this.deep = GetDomDeep(dom);
        layoutList.push(this);
        layoutList.sort(Sort);

        /***** 查找各区 *****/
        for (var i = 0; i < dom.childNodes.length; i++) {
            var node = dom.childNodes[i];
            if (node.nodeType != 1) continue;
            var dock = node.getAttribute("dock");
            switch (dock) {
                case "top":
                    this.areaTop = node;
                    //this.areaTop.height = this.areaTop.clientHeight;
                    if (this.option.top == null) {
                        this.option.top = this.areaTop.clientHeight;
                    }
                    ResetStyle(node);
                    break;
                case "left":
                    this.areaLeft = node;
                    //this.areaLeft.width = this.areaLeft.clientWidth;
                    if (this.option.left == null) {
                        this.option.left = this.areaLeft.clientWidth;
                    }
                    ResetStyle(node);
                    break;
                case "center":
                    this.areaCenter = node;
                    ResetStyle(node);
                    break;
                case "right":
                    this.areaRight = node;
                    //this.areaRight.width = this.areaRight.clientWidth;
                    if (this.option.right == null) {
                        this.option.right = this.areaRight.clientWidth;
                    }
                    ResetStyle(node);
                    break;
                case "bottom":
                    this.areaBottom = node;
                    //this.areaBottom.height = this.areaBottom.clientHeight;
                    if (this.option.bottom == null) {
                        this.option.bottom = this.areaBottom.clientHeight;
                    }
                    ResetStyle(node);
                    break;
            }
        }
    }

    function SetWidth(dom, w) {
        if (w <= 0) w = 0;
        dom.style.width = w + "px";
    }
    function SetHeight(dom, h) {
        if (h <= 0) h = 0;
        dom.style.height = h + "px";
    }

    function Refresh() {
        var h = this.rootDom.clientHeight;
        var w = this.rootDom.clientWidth;

        var topHeight = (this.areaTop == null ? 0 : this.option.top);
        var bottomHeight = (this.areaBottom == null ? 0 : this.option.bottom);
        var leftWidth = (this.areaLeft == null ? 0 : this.option.left);
        var rightWidth = (this.areaRight == null ? 0 : this.option.right);

        if (this.areaTop != null) {
            SetWidth(this.areaTop, w);
            this.areaTop.style.left = "0px";
            this.areaTop.style.top = "0px";
        }

        if (this.areaLeft != null) {
            this.areaLeft.style.left = "0px";
            this.areaLeft.style.top = topHeight + "px";
            SetHeight(this.areaLeft, h - topHeight - bottomHeight);
        }

        if (this.areaCenter != null) {
            this.areaCenter.style.left = leftWidth + "px";
            this.areaCenter.style.top = topHeight + "px";
            SetWidth(this.areaCenter, w - leftWidth - rightWidth);
            SetHeight(this.areaCenter, h - topHeight - bottomHeight);
        }
        if (this.areaRight != null) {
            SetHeight(this.areaRight, h - topHeight - bottomHeight);
            this.areaRight.style.top = topHeight + "px";
            var tmp = (w - rightWidth);
            if (tmp <= 0) tmp = 0;
            this.areaRight.style.left = tmp + "px";
        }

        if (this.areaBottom != null) {
            this.areaBottom.style.left = "0px";
            this.areaBottom.style.top = (h - bottomHeight) + "px";
            SetWidth(this.areaBottom, w);
        }

        this.onRefresh();
    }

    return {
        BindDom: BindDom,
        Refresh: Refresh,
        onRefresh: function() { }
    };
})();