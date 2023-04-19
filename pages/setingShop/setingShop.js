import config from '../../utils/config.js'

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
    shopName: '',
    shopAd: '',
    shopWx: '',
    imgUrl: '',
    type: 0, //1:只查找店铺信息，0：查找店铺和银行卡信息
    userShopInfo: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._load();
  },

  //我的店铺
  _load() {
    let postData = {
      fansUserId: app.globalData.userId,
      type: this.data.type,
    }

    app.dataPost({ url: 'mobile/fansUserShop/userShopAndBankCard', data: postData, success: this.myShop });
  },

  myShop(res) {
    console.log(res);
    this.setData({
      userShopInfo: res.data.userShopInfo,
      userBankCardInfo: res.data.userBankCardInfo,
      shopName: res.data.userShopInfo.shopName,
      shopAd: res.data.userShopInfo.adContent,
      shopWx: res.data.userShopInfo.wechatId,
      imgUrl: res.data.userShopInfo.logoImageUrl,
      logoImageId: res.data.userShopInfo.logoImageId,
      pFansUserId: res.data.userShopInfo.pFansUserId,
      userShopId: res.data.userShopInfo.id,
      isLoad: true
    });

  },

  // 获取文本当前长度
  getTextLen(e) {
    let ind = e.currentTarget.dataset.index;
    if (ind == 0) {
      this.setData({
        nameNowLen: e.detail.value.length
      });
    };
    if (ind == 1) {
      this.setData({
        adNowLen: e.detail.value.length
      });
    };
    if (ind == 2) {
      this.setData({
        wxNowLen: e.detail.value.length
      });
    };
  },

  /**
   * 进入页面
   */
  enterPage(e) {
    let url = e.currentTarget.dataset.url
    if (url)
      wx.navigateTo({
        url: url
      })
  },

  //保存
  postForm(e) {
    console.log(e.detail.formId);

    this.setData({
      formId: e.detail.formId
    });

    let _this = this;

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        this.setData({
          imgUrl: res.tempFilePaths[0]
        });

        let model = 'MallFansUserShop';
        let field = 'shop_Logo_Image_Id';

        wx.uploadFile({
          url: config.restUrl + 'rest/upload/uploadImage', //仅为示例，非真实的接口地址
          filePath: _this.data.imgUrl,
          name: 'file',
          formData: {
            model: model,
            field: field
          },
          success: function (res) {
            console.log(res);
            var imgid = JSON.parse(res.data);

            _this.setData({
              logoImageId: imgid.imageId
            });
            
            _this.updateUser();
          }
        });
      }
    });
  },

  updateUser() {
    let postData = {
      fansUserId: app.globalData.userId,
      pFansUserId: this.data.pFansUserId,
      id: this.data.userShopId,
      logoImageId: this.data.logoImageId,
      shopName: this.data.shopName,
      wechatId: this.data.shopWx,
      adContent: this.data.shopAd,
      formId: this.data.formId,
    };

    console.log('修改头像');
    console.log(postData);

    app.dataPost({ url: 'mobile/fansUserShop/updateUserShopInfo', data: postData, success: this.updateUserShopInfo });
  },

  updateUserShopInfo(res) {
    console.log('修改信息');
    console.log(res);
  },

  // 弹窗提示
  tipsAlert(str) {
    wx.showToast({
      title: str,
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this._load();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})