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
//控制页面进行跳转
var SceneManager = (function (_super) {
    __extends(SceneManager, _super);
    function SceneManager() {
        var _this = _super.call(this) || this;
        _this.init();
        return _this;
    }
    SceneManager.instance = function () {
        if (!SceneManager._instance) {
            SceneManager._instance = new SceneManager();
        }
        return SceneManager._instance;
    };
    //初始化
    SceneManager.prototype.init = function () {
        //实例化两个场景
        this.beginScene = new SceneBegin();
        this.gameScene = new SceneGame();
        //默认添加开始场景
        this.addChild(this.beginScene);
    };
    //切换场景
    SceneManager.prototype.changeScene = function (type) {
        if (type == 'gameScene') {
            //释放资源
            this.beginScene.release();
        }
        //移除所有显示列表中的对象
        this.removeChildren();
        //添加下一个场景,因为type是字符串，所有下面的用 [] 的形式
        this.addChild(this[type]);
    };
    return SceneManager;
}(egret.Sprite));
__reflect(SceneManager.prototype, "SceneManager");
//# sourceMappingURL=SceneManager.js.map