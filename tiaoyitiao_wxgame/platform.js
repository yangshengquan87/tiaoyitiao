/**
 * 请在白鹭引擎的Main.ts中调用 platform.login() 方法调用至此处。
 */

class WxgamePlatform {

    name = 'wxgame';
    wxUrl = 'https://mapi.yang021.cn';
    code = '';
    login() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                  this.code = res.code;//将code存到变量中
                  resolve(res)
                }
            })
        })
    }


  // 首次进入游戏触发，获取用户信息
  getUserInfo() {
    let left = Math.floor((wx.getSystemInfoSync().windowWidth - 150) / 2);
    let top = Math.floor(wx.getSystemInfoSync().windowHeight - 120);
    //获取微信界面大小
    return new Promise((resolve, reject) => {
      if(wx.getStorageSync('isAuth') == 1){
        let userInfo =  wx.getStorageSync('userInfo');
        resolve(userInfo);
      }else{
        var button = wx.createUserInfoButton({
          type: 'text',
          text: '开始游戏',
          style: {
              left: left,
              top: top,
              width: 150,
              height: 50,
              lineHeight: 50,
              backgroundColor: '#ffffff',
              color: '#BDBDBD',
              textAlign: 'center',
              fontSize: 25,
              borderRadius: 25
          }
        });
        button.onTap((res) => {
          if (res.userInfo) {
            var userInfo = res.userInfo;
            var url = this.wxUrl + '/getSess';// 存在全局的url
            var params = {
                "code": this.code,  // code为登录时存的全局变量
                "encryptedData": res.encryptedData,
                "iv": res.iv,
                'avatarUrl':res.avatarUrl,
                "package":'tiaoyitiao'
            }
            var result = this.postData(url, params, true);
            result.then((resu) => {
              if (resu.data) {
                wx.setStorageSync('isAuth', 1); // 本地缓存是否授权,用以判断是否显示登录页
                wx.setStorageSync('userInfo', userInfo);// 本地缓存用户数据
                button.destroy();
                resolve(userInfo)
              } else {
                wx.showToast({
                  title: '出错啦',
                  icon: 'none'
                })
              }
            }).catch((err) => {

            })

          } else {
            wx.showToast({
              title: '请先授权!',
              icon: 'none',
              duration: 1500
            })
            wx.setStorageSync('isAuth', 0)
          }
        });
      }
    })
  
  }

// 请求数据方法
  postData(url, data, isShowTips = true) {
    return new Promise((resolve, reject) => {
      if (isShowTips) {
        wx.showLoading({
          title: '加载中',
        })
      }
      wx.request({
        url: url,
        data: data,
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          resolve(res);
        },
        fail: function (err) {
          reject(err);
        },
        complete: function () {
          if (isShowTips) {
            wx.hideLoading();
          }
        }
      })
    })
  }


    showShareMenu(){
        return new Promise((resolve,reject)=>{
          var that = this;
          wx.showShareMenu({
              showShareTicket:true,
              success:function(res){
                  resolve(res);
              },
              fail:function(res){},
              complete: function(res) {},
          })

          // 被动转发
          wx.onShareAppMessage(function () {
            console.log(that.wxUrl);
            // 用户点击了“转发”按钮
            return {
              title: '被动转发',
              imageUrl:that.wxUrl + '/uploads/goods/20180629/1e4981b5c6cf27ca4d1e6a45e5e1724f.jpg',
              success: (res) => {
                console.log("转发成功", res);
              },
              fail: (res) => {
                console.log("转发失败", res)
              },
            }
          })
        })
    }

    // 主动转发（分享）
    shareAppMessage() {
      return new Promise((resolve, reject) => {
        var that = this;
        wx.shareAppMessage({
            title: '主动分享',
            imageUrl: that.wxUrl + '/uploads/goods/20180629/1e4981b5c6cf27ca4d1e6a45e5e1724f.jpg',
            query: "a=1&b=2&c=3&d=4",
        })
      })
    }

    openDataContext = new WxgameOpenDataContext();
}

class WxgameOpenDataContext {

    createDisplayObject(type, width, height) {
        const bitmapdata = new egret.BitmapData(sharedCanvas);
        bitmapdata.$deleteSource = false;
        const texture = new egret.Texture();
        texture._setBitmapData(bitmapdata);
        const bitmap = new egret.Bitmap(texture);
        bitmap.width = width;
        bitmap.height = height;

        if (egret.Capabilities.renderMode == "webgl") {
            const renderContext = egret.wxgame.WebGLRenderContext.getInstance();
            const context = renderContext.context;
            ////需要用到最新的微信版本
            ////调用其接口WebGLRenderingContext.wxBindCanvasTexture(number texture, Canvas canvas)
            ////如果没有该接口，会进行如下处理，保证画面渲染正确，但会占用内存。
            if (!context.wxBindCanvasTexture) {
                egret.startTick((timeStarmp) => {
                    egret.WebGLUtils.deleteWebGLTexture(bitmapdata.webGLTexture);
                    bitmapdata.webGLTexture = null;
                    return false;
                }, this);
            }
        }
        return bitmap;
    }


    postMessage(data) {
        const openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage(data);
    }
}


window.platform = new WxgamePlatform();