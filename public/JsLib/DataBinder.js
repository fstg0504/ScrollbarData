
/*     DBRef�࣬ʵ�ֵ�������ӳ��      */
function DBRef(tag, tagAttr, data, dataAttr) {
    this.data = data;   /*     ����Դ      */
    this.dataAttr = dataAttr;    /*     ������ֵ      */

    this.tag = tag;     /*     Ŀ��      */
    this.tagAttr = tagAttr; /*     Ŀ������      */
    if (this.tagAttr == null) {
        this.tagAttr = this.GetDefaultAttr(this.tag);
    }
}
DBRef.prototype = {
    /*     ��ȡĬ�ϰ�����      */
    GetDefaultAttr: function(tag) {
        var tn = tag.tagName.toLowerCase();
        /*     Ĭ�ϰ�����      */
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
    /*      ��ȡ���� data->tag      */
    Read: function() {
        try {
            eval("this.tag." + this.tagAttr + " = this.data." + this.dataAttr + ";");
        } catch (e) { window.status = "Reading Error!"; }
    },
    /*     �������� tag->data      */
    Save: function() {
        try {
            eval("this.data." + this.dataAttr + " = this.tag." + this.tagAttr + ";");
        } catch (e) { window.status = "Saving Error!"; }
    }
};
/*     DataBinder�࣬ʵ��һ���ݶ���{}��һ��HTML�ؼ�����֮���ӳ���ϵ      */
/*     
mapList��ʽ: 
[{id:"�ӿؼ�ID",attr:"�ӿؼ���ֵ����",field:"����Դ�ֶ���"},
{id:"�ӿؼ�ID",attr:"�ӿؼ���ֵ����",field:"����Դ�ֶ���"},.......];
     */
function DataBinder(rootCtrl, data, mapList) {
    if (typeof (rootCtrl) == "string") {
        rootCtrl = document.getElementById(rootCtrl);
    }
    this.root = rootCtrl;   /*     HTML��ǩ���ڵ�      */
    this.data = data;
    this.mapList = mapList;
    this.refs = [];

    /*     ����ӳ���ϵ      */
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

/*     ģ����      */
function Repeater() {
    this.tpl = null;    /*      ģ��      */
    this.container = null;  /*      ����      */
    this.items = [];    /*      �����      */
    this.dataList = []; /*      ���ݼ�      */
    this.mapList = [];  /*      ӳ���ϵ      */
    this.index = 0;
    this.syncData = false;
}
Repeater.prototype = {
    /*      ����ģ��      */
    setTpl: function(elm) {
        if (typeof (elm) == "string") {
            var dom = document.getElementById(elm);
            this.tpl = dom;
        }
        else {
            this.tpl = elm;
        }
    },
    /*      ��������      */
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
    /*     ��������Դ      */
    setDataList: function(dl) { this.dataList = dl; },
    CreateItem: function(data) {
        var item = this.defaultCreateItem();
        var db = new DataBinder(item, data, this.mapList);
        db.Read();
        item.dataBinder = db;   /*     ���ð�������      */
        item.data = data;       /*     ������������      */
        return item;
    },
    /*     ��������£��û����滻�÷����������б���      */
    defaultCreateItem: function() {
        var item = this.tpl.cloneNode(true);
        return item;
    },
    /*      ���һ��      */
    AddItem: function(item) { this.defaultAddItem(item); this.items.push(item); },
    /*     ��������£��û����滻�÷���������б���      */
    defaultAddItem: function(item) { this.container.appendChild(item); },
    /*      ɾ��һ��      */
    RemoveItem: function(item) { this.defaultRemoveItem(item); this.items.remove(item); },
    /*     ��������£��û����滻�÷�����ɾ���б���      */
    defaultRemoveItem: function(item) { this.container.removeChild(item); },
    /*      �������      */
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