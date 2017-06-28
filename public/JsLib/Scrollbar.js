function Scrollbar(type) {
    this.type = type;   /*  滚动条类型，v:垂直(默认)，h:水平      */
    if (this.type == null) this.type = "v";
    
    this.options = {
        total: 0,   /*  数据总数      */
        itemSize: 20,  /*  单项尺寸      */
        size: 200  /*  控件尺寸      */
    };
}
Scrollbar.prototype = (function() {
    function setOptions(options) {
        for (var attr in options) {
            this.options[attr] = options[attr];
        }
        Refresh(this);
    }

    function Refresh(_this) {
        if (!_this.created) return;

        var ch = _this.options.total * _this.options.itemSize;
        if (_this.type == "v") {
            /*  设置控件尺寸      */
            _this.bar.style.height = _this.options.size + "px";

            /*  设置内容尺寸      */
            _this.content.style.height = ch + "px";
        }
        else {
            _this.bar.style.width = _this.options.size + "px";
            _this.content.style.width = ch + "px";
        }
    }

    /*  获取滚动位置      */
    function getPos() {
        var bPos;
        if (this.type == "v") {
            bPos = this.bar.scrollTop;
        }
        else {
            bPos = this.bar.scrollLeft;
        }
        var pos = parseInt(bPos / this.options.itemSize);
        return pos;
    }

    /*  每页可展示的数据数量      */
    function getPageItems() {
        return this.options.size / this.options.itemSize;
    }

    /*  滚动事件响应      */
    function OnScroll(_this) {
        var pos = _this.getPos();
        if (pos == _this.lastPos) return;
        _this.lastPos = pos;
        _this.onScroll(pos);
    }

    /*  滚动条创建      */
    function CreateAt(dom) {
        var _this = this;

        var bar = document.createElement("div");
        var content = document.createElement("div");
        bar.appendChild(content);

        if (this.type == "v") {
            bar.style.width = "19px";
            content.style.width = "1px";
        }
        else {
            bar.style.height = "19px";
            content.style.height = "1px";
        }
        bar.style.overflowY = this.type == "v" ? "scroll" : "hidden";
        bar.style.overflowX = this.type == "v" ? "hidden" : "scroll";
        content.style.backgroundColor = "white";

        if (bar.attachEvent) {
            bar.attachEvent("onscroll", function() { OnScroll(_this); });
        }
        else {/*  firefox兼容      */
            bar.addEventListener("scroll", function() { OnScroll(_this); }, false);
        }

        this.bar = bar;
        this.content = content;

        if (typeof (dom) == "string") {
            dom = document.getElementById(dom);
        }
        dom.innerHTML = "";
        dom.appendChild(this.bar);
        this.created = true;
        Refresh(this);
    }

    return {
        setOptions: setOptions,
        CreateAt: CreateAt,
        getPos: getPos,
        getPageItems: getPageItems,
        onScroll: function() { }  /*  模拟滚动条事件      */
    };
})();