
/*     DBRef类，实现单个属性映射      */
function DBRef(tag, tagAttr, data, dataAttr) {
    this.data = data;   /*     数据源      */
    this.dataAttr = dataAttr;    /*     绑定属性值      */

    this.tag = tag;     /*     目标      */
    this.tagAttr = tagAttr; /*     目标属性      */
    if (this.tagAttr == null) {
        this.tagAttr = this.GetDefaultAttr(this.tag);
    }
}
DBRef.prototype = {
    /*     获取默认绑定属性      */
    GetDefaultAttr: function(tag) {
        var tn = tag.tagName.toLowerCase();
        /*     默认绑定属性      */
        var defaultAttr = {
            input: "value",
            select: "value",
            a: "href",
            img: "src",
            textarea: "value"
        };
        if (defaultAttr[tn] == null) {
            return "innerHTML";
        }
        return defaultAttr[tn];
    },
    /*      读取数据 data->tag      */
    Read: function() {
        try {
            eval("this.tag." + this.tagAttr + " = this.data." + this.dataAttr + ";");
        } catch (e) { window.status = "Reading Error!"; }
    },
    /*     保存数据 tag->data      */
    Save: function() {
        try {
            eval("this.data." + this.dataAttr + " = this.tag." + this.tagAttr + ";");
        } catch (e) { window.status = "Saving Error!"; }
    }
};
/*     DataBinder类，实现一数据对象{}到一组HTML控件属性之间的映射关系      */
/*     
mapList格式: 
[{id:"子控件ID",attr:"子控件赋值属性",field:"数据源字段名"},
{id:"子控件ID",attr:"子控件赋值属性",field:"数据源字段名"},.......];
     */
function DataBinder(rootCtrl, data, mapList) {
    if (typeof (rootCtrl) == "string") {
        rootCtrl = document.getElementById(rootCtrl);
    }
    this.root = rootCtrl;   /*     HTML标签根节点      */
    this.data = data;
    this.mapList = mapList;
    this.refs = [];

    /*     构造映射关系      */
    for (var i = 0; i < this.mapList.length; i++) {
        var map = this.mapList[i];
        var tag = Public.FindChild(this.root, map.id);
        if (tag == null) continue;
        var ref = new DBRef(tag, map.attr, this.data, map.field);
        this.refs.push(ref);
    }
};
DataBinder.prototype = {
    Read: function() {
        for (var i = 0; i < this.refs.length; i++) {
            var ref = this.refs[i];
            ref.Read();
        }
    },
    Save: function() {
        for (var i = 0; i < this.refs.length; i++) {
            var ref = this.refs[i];
            ref.Save();
        }
    },
    setData: function(data) {
        for (var i = 0; i < this.refs.length; i++) {
            this.refs[i].data = data;
        }
        this.data = data;
    }
};

/*     模板类      */
function Repeater() {
    this.tpl = null;    /*      模板      */
    this.container = null;  /*      容器      */
    this.items = [];    /*      子项集合      */
    this.dataList = []; /*      数据集      */
    this.mapList = [];  /*      映射关系      */
    this.index = 0;
    this.syncData = false;
}
Repeater.prototype = {
    /*      设置模板      */
    setTpl: function(elm) {
        if (typeof (elm) == "string") {
            var dom = document.getElementById(elm);
            this.tpl = dom;
        }
        else {
            this.tpl = elm;
        }
    },
    /*      设置容器      */
    setContainer: function(elm) {
        var dom;
        if (typeof (elm) == "string") {
            dom = document.getElementById(elm);
        }
        else {
            dom = elm;
        }
        this.container = dom;
    },
    setMapList: function(ml) {
        this.mapList = ml;
    },
    setSyncData: function(bSync) {
        this.syncData = bSync;
    },
    onBinding: function(item) { },
    Bind: function(bContinue) {
        if (bContinue == null) {
            this.index = 0;
        }
        var startIndex = this.index;
        var t1 = new Date();
        for (var i = startIndex; i < this.dataList.length; i++) {
            var data = this.dataList[i];
            var item = this.CreateItem(data);
            this.AddItem(item);
            this.onBinding(item);
            var t2 = new Date();
            if (t2.getTime() - t1.getTime() > 200) {
                this.index = i + 1;
                var _this = this;
                setTimeout(function() { _this.Bind(true); }, 1);
                return;
            }
        }
    },
    /*     设置数据源      */
    setDataList: function(dl) { this.dataList = dl; },
    CreateItem: function(data) {
        var item = this.defaultCreateItem();
        var db = new DataBinder(item, data, this.mapList);
        db.Read();
        item.dataBinder = db;   /*     设置绑定器引用      */
        item.data = data;       /*     设置数据引用      */
        return item;
    },
    /*     特殊情况下，用户可替换该方法，创建列表项      */
    defaultCreateItem: function() {
        var item = this.tpl.cloneNode(true);
        return item;
    },
    /*      添加一项      */
    AddItem: function(item) { this.defaultAddItem(item); this.items.push(item); },
    /*     特殊情况下，用户可替换该方法，添加列表项      */
    defaultAddItem: function(item) { this.container.appendChild(item); },
    /*      删除一项      */
    RemoveItem: function(item) { this.defaultRemoveItem(item); this.items.remove(item); },
    /*     特殊情况下，用户可替换该方法，删除列表项      */
    defaultRemoveItem: function(item) { this.container.removeChild(item); },
    /*      清空所有      */
    Clear: function() { this.container.innerHTML = ""; this.items = []; },
    Read: function() {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            item.dataBinder.Read();
        }
    },
    Save: function() {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            item.dataBinder.Save();
        }
    }
}

function DataList(list) {
    this.setList(list);
    this.curIndex = 0;
    this.isBinding = false;
    this.sync = true;
}
DataList.prototype = (function() {
    function setList(list) {
        this.list = [];
        if (list == null) return;
        for (var i = 0; i < list.length; i++) {
            this.list[i] = list[i];
        }
    }

    function getIndex(data) {
        for (var i = 0; i < this.list.length; i++) {
            if (data == this.list[i]) {
                return i;
            }
        }
        return null;
    }

    function Add(data) {
        this.onAdd(data);
        this.list.push(data);
    }

    function Clear() {
        this.onClear();
        this.list = [];
    }

    function Insert(data, index) {
        this.onInsert(data, index);
        for (var i = this.list.length; i > index; i--) {
            this.list[i] = this.list[i - 1];
        }
        this.list[index] = data;
    }

    function Move(data, newIndex) {
        this.onMove(data, newIndex);
        var index = this.getIndex(data);
        if (index == null || index == newIndex) return;
        var step = newIndex > index ? 1 : -1;
        while (index != newIndex) {
            this.list[index] = this.list[index + step];
            index += step;
        }
        this.list[index] = data;
    }

    function Remove(data) {
        this.onRemove(data);
        var index = this.getIndex(data);
        if (index == null) return;
        this.list.splice(index, 1);
    }

    function Bind() {
        if (!this.isBinding) {
            this.isBinding = true;
            this.curIndex = 0;
        }
        else {
            this.curIndex++;
        }
        var startTime = new Date();
        for (; this.curIndex < this.list.length; this.curIndex++) {
            var data = this.list[this.curIndex];
            this.onBinding(data);
            var curTime = new Date();
            if (!this.sync) continue;
            if (curTime.getTime() - startTime.getTime() > 200) {
                var _this = this;
                setTimeout(function() { _this.Bind(); }, 1);
                return;
            }
        }
        this.isBinding = false;
    }

    return {
        setList: setList,
        getList: function() { return this.list; },
        getIndex: getIndex,

        onAdd: function(data) { },
        onRemove: function(data) { },
        onInsert: function(data, index) { },
        onClear: function() { },
        onBinding: function(data) { },
        onMove: function(data, newIndex) { },

        Add: Add,
        Remove: Remove,
        Insert: Insert,
        Clear: Clear,
        Bind: Bind,
        Move: Move
    };
})();