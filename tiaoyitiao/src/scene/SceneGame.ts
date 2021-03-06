class SceneGame extends eui.Component implements  eui.UIComponent {
	//盒子场景面板,游戏场景组
	public blockPanel:eui.Group;
	//小人
	public player:eui.Image;
	//显示的得分（字符串），游戏场景中得分
	public scoreLabel:eui.Label;
	//游戏结束场景
	public overPanel:eui.Group;
	//结束场景得分
	public overScoreLabel:eui.Label;
	//重新开始按钮
	public restartBtn:eui.Button;

	//所有方块资源的数组
	private blockSourceNames:Array<string> = [];
	//按下的音频
	private pushVoice:egret.Sound;
	//按下音频的SoundChannel对象
	private pushSoundChannel:egret.SoundChannel;
	//弹跳的音频
	private jumpVoice:egret.Sound;
	//所有屏幕上方块的对像的数组
	private blockArr:Array<eui.Image> = [];
	//所有回收方块存放的数组（对象池）
	private rebackBlockArr:Array<eui.Image> = [];
	//当前的盒子（最新出现的盒子）
	private currentBlock:eui.Image;
	//下一个盒子出现的方向（1：靠右出现，-1：靠左出现）
	private direction:number = 1;
	//随机盒子距离跳台的距离
	private minDistance = 240;
	private maxDistance = 320;
	//tan0的角度值
	public tanAngle:number = 0.556047197640118;
	//跳的距离
	public jumpDistance:number = 1;
	//判断是否处于按下状态
	private isReadyJump = false;
	//落脚点
	private targetPos:egret.Point;
	// 左侧跳跃点（固定的，可自己微调）
	private leftOrigin = {x:180,y:350};
	// 右侧跳跃点（固定的，可自己微调）
	private rightOrigin = {x:505,y:350};
	//游戏中的得分
	private score = 0;

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
		this.init();

		//布置舞台
		this.reset();
	}

	//游戏场景初始化
	private init(){
		this.blockSourceNames = ['block1_png','block2_png','block3_png'];
		//初始化音频
		this.pushVoice = RES.getRes('push_mp3');
		this.jumpVoice = RES.getRes('jump_mp3');

		//添加触摸事件
		this.blockPanel.touchEnabled = true;
		//按下蓄力
		this.blockPanel.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.onKeyDown,this);
		//松开弹跳
		this.blockPanel.addEventListener(egret.TouchEvent.TOUCH_END,this.onKeyUp,this);
		//绑定重新开始按钮
		this.restartBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.restartHandler,this);
		
		//设置玩家锚点
		this.player.anchorOffsetX = this.player.width/2;
		this.player.anchorOffsetY = this.player.height;

		//蓄力的逻辑
		egret.Ticker.getInstance().register((dt)=>{
			dt /= 1000;
			if(this.isReadyJump){
				this.jumpDistance += 300 * dt;
			}
		},this)

	}

	private onKeyDown(){
		// 播放按下的音频
		this.pushSoundChannel = this.pushVoice.play(0,1);// 0:从头开始，1:播放次数
		// 使小人变矮做出积蓄能量的效果，就是缩放Y轴
		egret.Tween.get(this.player).to({
			scaleY:0.5,
		},3000);
		// egret.Tween.get(this.currentBlock).to({
		// 	scaleY:0.5,
		// },3000);
		// 开始蓄力，用来计算跳跃距离
		this.isReadyJump = true;
	}

	private onKeyUp(){
		// 判断是否处于按下的状态
		if(!this.isReadyJump){
			return;
		}
		// 实例化落点坐标
		if(!this.targetPos){
			this.targetPos = new egret.Point();
		}
		// 立刻让p屏幕不可点，等小 i 落地后才能重新点
		this.blockPanel.touchEnabled = false;
		// 停止播放按压音频，并且播放弹跳音频
		this.pushSoundChannel.stop();
		this.jumpVoice.play(0,1);
		
		// 弹跳的时候清除所有的动画
		egret.Tween.removeAllTweens();
		this.blockPanel.addChild(this.player);
		// 结束准备跳跃状态（按压状态）
		this.isReadyJump = false;
		// 落点坐标
		this.targetPos.x = this.player.x + this.jumpDistance * this.direction;
		// 根据落点重新j计算斜率，确保小 i 往目标中心点跳跃
		// (this.currentBlock.y - this.player.y) / (this.currentBlock.x - this.player.x) 新的斜率tan0
		this.targetPos.y = this.player.y + this.jumpDistance * (this.currentBlock.y - this.player.y) / (this.currentBlock.x - this.player.x) * this.direction;
		// 执行跳跃动画
		egret.Tween.get(this).to({factor:1},500).call(()=>{
			this.player.scaleY = 1;
			this.jumpDistance = 0;
			// 判断是否成功跳跃到下一个方格上
			this.judgeResult();
		})
	}

//  判断是否成功跳跃到下一个方格上
	private judgeResult(){
		if(Math.pow(this.currentBlock.x - this.player.x, 2) + Math.pow(this.currentBlock.y - this.player.y, 2) <= 70 * 70){
			// 说明落在了盒子中
			// 更新积分
			this.score++;
			this.scoreLabel.text = this.score.toString();
			// 随机下一个方格出现的方向
			this.direction = Math.random() > 0.5 ? 1 : -1;
			// 当前方块移动到相应的跳跃点位置
			var blockX,blockY;
			blockX = this.direction > 0? this.leftOrigin.x : this.rightOrigin.x;
			blockY = this.height/2 + this.currentBlock.height;
			// 小 i 要移动到的点
			var playerX,playerY;
			playerX = this.player.x - (this.currentBlock.x - blockX);
			playerY = this.player.y - (this.currentBlock.y - blockY);
			// 更新页面(传参x轴移动的距离，y轴移动的距离)
			this.update(this.currentBlock.x - blockX , this.currentBlock.y - blockY);
			// 更新小i的位置
			egret.Tween.get(this.player).to({
				x: playerX,
				y: playerY
			},1000).call(()=>{
				// 开始创建下一个方块
				this.addBlock();
				// 让屏幕重新可以点击
				this.blockPanel.touchEnabled = true;
			});
		}else{
			// 游戏失败，显示游戏结束场景
			this.overPanel.visible = true;
			this.overScoreLabel.text = this.score.toString();
		}
		
	}

	private update(x,y){
		egret.Tween.removeAllTweens();
		for(var i:number = this.blockArr.length - 1; i>=0; i--){
			var blockNode = this.blockArr[i];
			if(blockNode.x + (blockNode.width - 222) < 0 || blockNode.x -222 > this.width || blockNode.y -78 > this.height){
				// 分别超出左侧右侧下方屏幕，则将该方块从屏幕中移除
				this.blockPanel.removeChild(blockNode);
				this.blockArr.splice(i,i);
				// 添加到对象池中
				this.rebackBlockArr.push(blockNode);
			}else{
				// 如果没有超出屏幕，则移动它
				egret.Tween.get(blockNode).to({
					x: blockNode.x -x,
					y: blockNode.y -y
				},1000)
			}
		}
	}

	public get factor():number{
		return 0;
	}

	// 跳跃曲线：B(t) = (1-t)^2P0 + 2t(1-t)P1 + t^2P2,t在[0,1]之间
	public set factor(value:number){
		this.player.x = (1-value) * (1-value) * this.player.x + 2 * value * (1-value) * (this.player.x + this.targetPos.x)/2 + value * value * (this.targetPos.x);
		this.player.y = (1-value) * (1-value) * this.player.y + 2 * value * (1-value) * (this.targetPos.y - 300) + value * value * (this.targetPos.y);
	}



	private restartHandler(){
		// 隐藏结束场景
		this.overPanel.visible = false;
		// 置空积分
		this.score = 0;
		this.scoreLabel.text = '0';
		// 开始放置方块
		this.reset();
		// 游戏场景可点击
		this.blockPanel.touchEnabled = true;
	}

//  重置游戏
	public reset(){
		// 清空舞台
		this.blockPanel.removeChildren();
		this.blockArr = [];
		//添加一个方块
		let blockNode = this.createBlock();
		blockNode.touchEnabled = false;
		//设置方块的起始位置
		blockNode.x = 200;
		blockNode.y = this.height/2 + blockNode.height;
		this.currentBlock = blockNode;

		//摆正小人的位置
		this.player.x = this.currentBlock.x;
		this.player.y = this.currentBlock.y + 15;

		this.blockPanel.addChild(this.player);
		this.direction = 1;
		//添加积分显示
		this.blockPanel.addChild(this.scoreLabel);
		//下一个方块
		this.addBlock();
	}

//  工厂方法
	private createBlock():eui.Image{
		var blockNode:eui.Image = null;
		if(this.rebackBlockArr.length){
			//对象池里面有可用值，则直接取值
			blockNode = this.rebackBlockArr.splice(0,1)[0];
		}else{
			//对象池为空，则新建
			blockNode = new eui.Image();
		}
		//随机方块背景图
		let num = Math.floor(Math.random() * this.blockSourceNames.length);
		blockNode.source = this.blockSourceNames[num];
		this.blockPanel.addChild(blockNode);
		//设置方块的锚点
		blockNode.anchorOffsetX = 222;
		blockNode.anchorOffsetY = 78;

		//把新创建的方块添加到blockArr里
		this.blockArr.push(blockNode);
		return blockNode;
	}


//  添加一个方块并设置 xy 值
	private addBlock(){
		// 创建一个方格
		let blockNode = this.createBlock();
		// 随机水平位置（在最大最小值之间的一个数，毕竟屏幕就那么大）
		let distance = this.minDistance + Math.random() * (this.maxDistance - this.minDistance);
		if(this.direction > 0){ // 向右跳
			blockNode.x = this.currentBlock.x + distance;
			blockNode.y = this.currentBlock.y - distance * this.tanAngle;
		}else{	// 向左跳
			blockNode.x = this.currentBlock.x - distance;
			blockNode.y = this.currentBlock.y - distance * this.tanAngle;
		}
		this.currentBlock = blockNode;
	}
	
}