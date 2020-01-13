class SceneBegin extends eui.Component implements  eui.UIComponent {
	public beginBtn:eui.Button;
	public constructor() {
		super();
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		//给开始按钮绑定点击事件
		// this.addEventListener();
		this.init();
	}

	private init() {
		this.beginBtn.visible = false
		// 这里的 once 其实就是 addEventListner 的意思，只不过它只监听一次
		this.beginBtn.once(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);
	}

	private tapHandler() {
		//切换游戏场景
		SceneManager.instance().changeScene('gameScene');
	}

	public release(){
		if(this.beginBtn.hasEventListener(egret.TouchEvent.TOUCH_TAP)){
			this.beginBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.tapHandler,this);
		}
	}

	
}