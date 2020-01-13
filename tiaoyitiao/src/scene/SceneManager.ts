//控制页面进行跳转
class SceneManager extends egret.Sprite {
	//设计成单例类
	private static _instance:SceneManager;
	public static instance():SceneManager{
		if(!SceneManager._instance){
			SceneManager._instance = new SceneManager();
		}
		return SceneManager._instance;
	}

	//开始场景
	private beginScene: SceneBegin;
	//游戏场景
	private gameScene: SceneGame;

	public constructor() {
		super();
		this.init();
	}

	//初始化
	private init(){
		//实例化两个场景
		this.beginScene = new SceneBegin();
		this.gameScene = new SceneGame();
		//默认添加开始场景
		this.addChild(this.beginScene);
	}

	//切换场景
	public changeScene(type:string){
		if(type == 'gameScene'){
			//释放资源
			this.beginScene.release();
		}
		//移除所有显示列表中的对象
		this.removeChildren();
		//添加下一个场景,因为type是字符串，所有下面的用 [] 的形式
		this.addChild(this[type]);
	}

}