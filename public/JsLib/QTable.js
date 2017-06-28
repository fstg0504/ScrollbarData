/// <reference path="Lib.js" />
/// <reference path="Scrollbar.js" />
/// <reference path="BorderLayout.js" />
/// <reference path="DataBinder.js" />


include("Scrollbar.js");
include("BorderLayout.js");
include("DataBinder.js");
function QTable() {
}
QTable.prototype = (function() {
    function BindDom(dom) {
        if (typeof (dom) == "string") dom = document.getElementById(dom);
        var _this = this;

        /*  获取表格    */
        var tables = dom.getElementsByTagName("table");
        var table = tables[0];
        table.style.tableLayout = "fixed";

        /*  获取数据显示Body和模板行，设置关键样式    */
        var dataBody = table.tBodies[0];
        var tplRow = dataBody.rows[0];
        tplRow.style.height = (tplRow.clientHeight) + "px";
        tplRow.style.whiteSpace = "nowrap";
        this.rowHeight = tplRow.clientHeight;
        dataBody.removeChild(tplRow);

        var headerRow = table.tHead.rows[0];
        headerRow.style.height = (headerRow.clientHeight) + "px";
        headerRow.style.whiteSpace = "nowrap";

        /*  重新修改控件结构    */
        dom.removeChild(table);
        var divTable = document.createElement("div");
        var divScrollbar = document.createElement("div");
        dom.appendChild(divTable);
        dom.appendChild(divScrollbar);
        divTable.setAttribute("dock", "center");
        divTable.style.overflow = "hidden";
        divScrollbar.setAttribute("dock", "right");

        var scrollBar = new Scrollbar("v");
        scrollBar.CreateAt(divScrollbar);
        divTable.appendChild(table);
        scrollBar.setOptions({ size: dom.clientHeight, itemSize: this.rowHeight });
        scrollBar.onScroll = function(pos) { RefreshData.call(_this); };

        this.table = table;
        this.tplRow = tplRow;
        this.scrollBar = scrollBar;
        this.root = dom;
        this.dataBody = dataBody;
        this.divTable = divTable;

        /*  调整position为layout准备     */
        var pos = dom.style.position;
        if (pos != "absolute" && pos != "relative" || pos == "") {
            dom.style.position = "relative";
        }
        var layout = new BorderLayout({ right: 19 });
        layout.onRefresh = function() { Refresh.call(_this); };
        layout.BindDom(dom);
        layout.Refresh();
    }
    function Refresh() {
        var tbl = this.table;
        var div = tbl.parentNode;
        tbl.style.width = div.clientWidth + "px";
    }

    /*
    数据映射表，JSON对象
    格式：{
    id:"绑定控件ID",
    field:"绑定数据字段",
    attr:"绑定控件属性" //可选
    }*/
    function setMaplist(mapList) {
        this.mapList = mapList;
    }

    function Clear() {
        var body = this.dataBody;
        var table = this.table;
        table.removeChild(body);
        body = document.createElement("tbody");
        table.appendChild(body);
        this.dataBody = body;
    }
    function getRows() {
        return this.dataBody.rows;
    }

    function BindData(dataList) {
        this.dataList = dataList;
        this.Clear();
        InitRows.call(this);
        var itemSize = this.scrollBar.options.size / dataList.length;
        this.scrollBar.setOptions({ total: dataList.length + parseInt(this.scrollBar.getPageItems()) });
        RefreshData.call(this);
    }
    function InitRows() {
        for (var i = 0; i < this.dataList.length; i++) {
            var row = this.tplRow.cloneNode(true);
            row.dataBinder = new DataBinder(row, null, this.mapList);
            this.dataBody.appendChild(row);
            if (this.table.clientHeight + this.rowHeight > this.divTable.clientHeight) {
                this.maxRows = i + 1;
                return;
            }
        }
    }

    function RefreshData() {
        var pos = this.scrollBar.getPos();
        if (pos > this.dataList.length - this.maxRows) {
            pos = this.dataList.length - this.maxRows;
        }
        var rows = this.getRows();
        for (var i = 0; i < this.maxRows; i++) {
            var data = this.dataList[i + pos];
            var row = rows[i];
            var db = row.dataBinder;
            row.data = data;
            db.setData(data);
            db.Read();
        }
    }

    return {
        BindDom: BindDom,
        setMaplist: setMaplist,
        BindData: BindData,
        getRows: getRows,
        Clear: Clear
    };
})();