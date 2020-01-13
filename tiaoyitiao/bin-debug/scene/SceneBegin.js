var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var SceneBegin = (function (_super) {
    __extends(SceneBegin, _super);
    function SceneBegin() {
        return _super.call(this) || this;
    }
    SceneBegin.prototype.partAdded = function (partName, instance) {
        _super.prototype.partAdded.call(this, partName, instance);
    };
    SceneBegin.prototype.childrenCreated = function () {
        _super.prototype.childrenCreated.call(this);
        //给开始按钮绑定点击事件
        // this.addEventListener();
        this.init();
    };
    SceneBegin.prototype.init = function () {
        // 这里的 once 其实就是 addEventListner 的意思，只不过它只监听一次
        this.beginBtn.once(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
    };
    SceneBegin.prototype.tapHandler = function () {
        //切换游戏场景
        SceneManager.instance().changeScene('gameScene');
    };
    SceneBegin.prototype.release = function () {
        if (this.beginBtn.hasEventListener(egret.TouchEvent.TOUCH_TAP)) {
            this.beginBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
        }
    };
    return SceneBegin;
}(eui.Component));
__reflect(SceneBegin.prototype, "SceneBegin", ["eui.UIComponent", "egret.DisplayObject"]);
//# sourceMappingURL=SceneBegin.js.map