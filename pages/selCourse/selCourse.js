var util = require('../../utils/util.js');

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isNoDay: false,
    is_first_action: true, //判断是否多次点击
    isLoad: false, //判断是否加载完成
    userCity: '', //用户当前城市
    sellOut: '',//是否售罄
    selInd: 0,//出发地选中索引值
    selMealInd: 0, //套餐选择索引值
    palaceData: [],
    mealData: [], //套餐
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    outingMonth: [],
    outingMonthArr: [],
    outingMonthObj: [],
    outingData: [],
    outingDataArry: [],
    selMonthNum: 0,//选中月份的索引
    selDayNum: '', //选中日期的索引
    selYear: '', //选中日期当前年份
    selMonth: '', //选中日期当前月份
    inputValue: ['1', '0'], //套餐初始值
    tipShow: false, //弹窗
    outingDate: [], //所以出发日期
    adultPrice: 0, //成人票价
    childPrice: 0, //儿童票价
    adultNum: 0, //成人票数量
    childNum: 0, //儿童票数量
    skuInfo: [], //规格信息
    departure: '', //出发地
    departure_date: '', //出发日期
    departure_date_: '', //出发日期-未转化格式
    ticket_type: 1, //票类型-成人票-1;儿童票2
    meal: '', //套餐类型
    mallProductNorm: [], //商品规格信息
    type: '', //1：原价购买，0：分享购买
    less: '', //立减金额
    productNormId: '', //规格id
    order: [], //商品详情
    amount: 0, //总价
    departure_: '', //出发地中文
    datePrices: [], //当前所有日期的价格
    datePricesArr: [], //当前日期价格数组 
    minMonth: 0, //当前最小月
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('商品详情-传参');
    console.log(options);
    this.setData({
      shopid: options.shopid,
      userFormId: options.formid,
      less: options.less,
      skuInfo: JSON.parse(options.sku),
      type: options.type,
      userCity: app.globalData.city.substr(0, app.globalData.city.length - 1) //用户当前所在城市
    });
    console.log('默认选中数据');
    console.log(this.data.skuInfo);

    this._load();
  },

  _load() {
    let nowYear = parseInt(util.formatTime(new Date()).substring(0, 4));
    let nowMonth = parseInt(util.formatTime(new Date()).substring(5, 7));
    let nowDay = parseInt(util.formatTime(new Date()).substring(8, 10));

    // let nowMonth = this.data.departure_date.substring(5, 7);
    // let nowDay = this.data.departure_date.substring(8, 10);

    this.setData({
      nowYear,
      nowDay,
      nowMonth,
    });


    for (let i = 0; i < this.data.skuInfo.skuProperty.length; i++) {
      if (this.data.skuInfo.skuProperty[i].field == 'departure') {
        this.setData({
          palaceData: this.data.skuInfo.cityCodeAndNameOuts, //所有出发地数据
          mealData: this.data.skuInfo.skus.meal, //套餐
        });
        console.log('套餐:', this.data.mealData);
        //默认选中
        for (let j = 0; j < this.data.skuInfo.skuProperty[i].options.length; j++) {
          if (this.data.skuInfo.skus.departure[0].value == this.data.skuInfo.skuProperty[i].options[j]) {
            this.setData({
              selInd: j
            });
          }
        };
      };
      if (this.data.skuInfo.skuProperty[i].field == 'departure_date') {
        this.setData({
          outingDate: this.data.skuInfo.skuProperty[i].options, //所有出发日期
        });
      };
    };

    console.log(this.data.palaceData);
    // console.log(this.data.outingDate);


    //出游日期-月份
    let outingMonthArr = [];

    for (let i = 0; i < this.data.skuInfo.skus.departure_date.length; i++) {
      let date = new Date(this.data.skuInfo.skus.departure_date[i].value);
      outingMonthArr[i] = this.getdate(date);
    };

    //默认所有日期价格
    this.setData({
      datePrices: this.data.skuInfo.datePrices
    });
    console.log('默认当前所有日期的价格::::', this.data.datePrices);

    this.setData({
      outingMonthArr: outingMonthArr, //出游日期-月份
      departure: this.data.skuInfo.skus.departure[0].value, //默认出发地
    });

    console.log(this.data.outingMonthArr);

    //获取当前出发地中文
    console.log('当前出发地长度::::', this.count(this.data.palaceData));
    for (let i = 0; i < this.count(this.data.palaceData); i++) {
      if (this.data.departure == this.data.palaceData[i].code) {
        this.setData({
          departure_: this.data.palaceData[i].name
        });
        console.log('当前出发地::::', this.data.departure_);
      };
    };

    //默认套餐
    this.setData({
      meal: this.data.mealData[0].value
    });

    console.log('默认套餐:', this.data.meal);


    for (let i = 0; i < this.data.skuInfo.skus.departure_date.length; i++) {
      if (this.data.skuInfo.skus.departure_date[i].value.substring(5, 7) >= this.data.nowMonth) {
        if (this.data.skuInfo.skus.departure_date[i].value.substring(5, 7) == this.data.nowMonth) {
          if (this.data.skuInfo.skus.departure_date[i].value.substring(8, 10) >= this.data.nowDay) {
            let departure_date = new Date(this.data.skuInfo.skus.departure_date[i].value);

            this.setData({
              departure_date: this.getdate(departure_date), //默认出发日期
              departure_date_: this.data.skuInfo.skus.departure_date[i].value
            });

            console.log(this.data.departure_date_);
            break;
          };
        } else {
          let departure_date = new Date(this.data.skuInfo.skus.departure_date[i].value);

          this.setData({
            departure_date: this.getdate(departure_date), //默认出发日期
            departure_date_: this.data.skuInfo.skus.departure_date[i].value
          });

          console.log(this.data.departure_date_);
          break;
        };
      };
    };

    console.log('当前票类型:', this.data.skuInfo.skus.ticket_type);
    if (this.data.skuInfo.skus.ticket_type.length > 1) {
      console.log('儿童-成人');
      this.setData({
        ticket_type: 1, //默认票类型
        'inputValue[0]': 1,
        'inputValue[1]': 0,
        adultNum: this.data.skuInfo.skus.ticket_type[0].num, //成人默认票数
        childNum: this.data.skuInfo.skus.ticket_type[1].num, //儿童默认票数
      });
    } else {
      if (this.data.skuInfo.skus.ticket_type[0].value == '1') {
        console.log('成人');
        this.setData({
          ticket_type: 1, //默认票类型
          'inputValue[0]': 1,
          'inputValue[1]': 0,
          adultNum: this.data.skuInfo.skus.ticket_type[0].num, //成人默认票数
          childNum: 0, //儿童默认票数
        });
      } else {
        console.log('儿童');
        this.setData({
          ticket_type: 2, //默认票类型
          'inputValue[0]': 0,
          'inputValue[1]': 1,
          adultNum: 0, //成人默认票数
          childNum: this.data.skuInfo.skus.ticket_type[0].num, //儿童默认票数
        });
      }
    };

    console.log('成人票数:' + this.data.adultNum);
    console.log('儿童票数:' + this.data.childNum);

    const outingMonthList = [];
    const outingMonth = this.data.outingMonthArr;
    const outingMonth_arr = [];
    const getoutingMonthArr = [];

    for (let i = 0; i < outingMonth.length; i++) {
      outingMonth_arr[i] = outingMonth[i].split("-").join("");
    };
    console.log('处理日期月份:', outingMonth_arr);

    //截取掉日期，留年月做判断
    for (let i = 0; i < outingMonth_arr.length; i++) {
      getoutingMonthArr[i] = outingMonth_arr[i].substring(0, 6);
    };

    for (let i = 0; i < this.uniq(getoutingMonthArr).length; i++) {
      outingMonthList.push({
        year: this.uniq(getoutingMonthArr)[i].substring(0, 4),
        month: this.uniq(getoutingMonthArr)[i].substring(4, 6)
      });
    };
    console.log('::::::::::::', outingMonthList);
    this.setData({
      outingMonthList
    });

    for (let i = 0; i < this.data.outingMonthList.length; i++) {
      if (this.data.nowMonth == this.data.outingMonthList[i].month) {
        this.setData({
          selMonthNum: i
        });
        break;
      };
    };

    //获取规格信息
    this.getSkuInfo();
    this.getOutingData();
    this.getCalendar(this.data.selMonthNum);

    for (let i = 0; i < this.data.outingDataArry.length; i++) {
      if (this.data.outingDataArry[i].month >= this.data.nowMonth) {
        if (this.data.outingDataArry[i].month == this.data.nowMonth) {
          if (this.data.outingDataArry[i].day >= this.data.nowDay) {
            this.setData({
              selDayNum: this.data.outingDataArry[i].day
            });
            break;
          }
        } else {
          this.setData({
            selDayNum: this.data.outingDataArry[0].day
          });
          break;
        };
      };
    };

    console.log('outingDataArry日期：：：', this.data.outingDataArry);

    console.log(this.data.selDayNum);

    // this.amountCount();

    // this.judgeCity();
  },

  /* 获取对象、数组的长度、元素个数
  *  @param obj 要计算长度的元素，可以为object、array、string
  */
  count(obj) {
    var objType = typeof obj;
    if (objType == "string") {
      return obj.length;
    } else if (objType == "object") {
      var objLen = 0;
      for (var i in obj) {
        objLen++;
      };
      return objLen;
    };

    return false;
  },

  //日期转换
  getdate(time) {
    var now = new Date(time),
      y = now.getFullYear(),
      m = now.getMonth() + 1,
      d = now.getDate();
    return y + "-" + (m > 9 ? m : "0" + m) + "-" + (d > 9 ? d : "0" + d);
  },

  //判断出发地是否有用户当前城市
  judgeCity() {
    let palaceData = this.data.palaceData;
    for (let i = 0; i < palaceData.length; i++) {
      if (palaceData[i] == this.data.userCity) {
        this.setData({
          selInd: i
        });
      };
    }
  },

  //选择出发地-判断是否有票
  selPlace(e) {
    this.setData({
      selInd: e.target.dataset.index,
      departure: e.target.dataset.item,
      departure_: e.target.dataset.name, //出发地
      departure_date: '', //出发日期
      departure_date_: '',
      // selMonthNum: 0, //月份重置
      selMealInd: 0, //套餐重置
    });

    for (let i = 0; i < this.data.outingMonthList.length; i++) {
      if (this.data.nowMonth == this.data.outingMonthList[i].month) {
        this.setData({
          selMonthNum: i
        });
        break;
      };
    };

    if (e.target.dataset.sellout == 'yes') {
      this.setData({
        sellOut: 'yes'
      });
      return;
    } else {
      this.setData({
        sellOut: 'no'
      });
    };

    this.getSkuInfo();
  },

  //选择套餐
  selMeal(e) {
    this.setData({
      selMealInd: e.target.dataset.index,
      meal: e.target.dataset.item,
      departure_date: '', //出发日期
      departure_date_: '',
      // selMonthNum: 0, //月份重置
    });

    for (let i = 0; i < this.data.outingMonthList.length; i++) {
      if (this.data.nowMonth == this.data.outingMonthList[i].month) {
        this.setData({
          selMonthNum: i
        });
        break;
      };
    };

    this.getSkuInfo();
  },

  //获取规格信息
  getSkuInfo() {
    let departure_date = new Date(this.data.departure_date);

    let postData = {
      productId: this.data.skuInfo.mallProductNorm.productId,
      userId: app.globalData.userId,
      businessId: app.globalData.businessId,
      departure: this.data.departure,
      departure_date: this.data.departure_date_,
      ticket_type: this.data.ticket_type,
      meal: this.data.meal, //套餐
    };

    console.log('postData信息:');
    console.log(postData);

    app.dataPost({ url: 'rest/product/skuSearch', data: postData, success: this.skuSearch });
  },

  skuSearch(res) {
    console.log('skuSearch返回数据');
    console.log(res);

    if (res.data.detail != '') {
      console.log('detail有数据');
      this.setData({
        mallProductNorm: res.data.detail.mallProductNorm,
        productNormId: res.data.detail.mallProductNorm.id,
        order: res.data.detail.mallProduct,
        prices: res.data.detail.prices
      });

      this.setData({
        datePrices: res.data.detail.datePrices
      });
      console.log('默认当前所有日期的价格::::', this.data.datePrices);

      console.log('当前价格长度::::', this.data.prices.length);
      //获取票价
      if (this.data.prices.length > 1) {
        //票价
        for (let i = 0; i < res.data.detail.prices.length; i++) {
          if (res.data.detail.prices[i].ticketType == '1') {
            this.setData({
              adultPrice: res.data.detail.prices[i].price,
            });
          };
          if (res.data.detail.prices[i].ticketType == '2') {
            this.setData({
              childPrice: res.data.detail.prices[i].price,
            });
          };
        };
        console.log('成人:', this.data.adultPrice);
        console.log('儿童:', this.data.childPrice);
        console.log('当前票类型:', res.data.skus.ticket_type);
        //数量
        for (let i = 0; i < res.data.skus.ticket_type.length; i++) {
          if (res.data.skus.ticket_type[i].value == '1') {
            this.setData({
              adultNum: res.data.skus.ticket_type[i].num,
            });
          };
          if (res.data.skus.ticket_type[i].value == '2') {
            this.setData({
              childNum: res.data.skus.ticket_type[i].num,
            });
          };
        };

        console.log('儿童-成人');
        this.setData({
          adultPrice: this.data.adultPrice,
          childPrice: this.data.childPrice,
          ticket_type: 1,
          childNum: this.data.childNum,
          adultNum: this.data.adultNum,
          'inputValue[0]': 1,
          'inputValue[1]': 0,
        });
        console.log('当前成人票数:::', this.data.adultNum);
        console.log('当前儿童票数:::', this.data.childNum);
      } else {
        if (this.data.prices[0].ticketType == '1') {
          console.log('成人');
          this.setData({
            adultPrice: res.data.detail.prices[0].price,
            childPrice: 0,
            ticket_type: 1,
            adultNum: res.data.skus.ticket_type[0].num,
            childNum: 0,
            'inputValue[0]': 1,
            'inputValue[1]': 0,
          });
        } else if (this.data.prices[0].ticketType == '2') {
          console.log('儿童');
          this.setData({
            adultPrice: 0,
            childPrice: res.data.detail.prices[0].price,
            ticket_type: 2,
            adultNum: 0,
            childNum: res.data.skus.ticket_type[0].num,
            'inputValue[0]': 0,
            'inputValue[1]': 1,
          });
        };

        console.log('当前成人票数:::', this.data.adultNum);
        console.log('当前儿童票数:::', this.data.childNum);
      };

      this.getOutingData();
      this.getCalendar(this.data.selMonthNum);
    } else {
      if (res.data.skus.departure_date.length) {
        let date = 0;
        for (let i = 0; i < res.data.skus.departure_date.length; i++) {
          if (res.data.skus.departure_date[i].value.substring(5, 7) >= this.data.nowMonth) {
            if (res.data.skus.departure_date[i].value.substring(5, 7) == this.data.nowMonth) {
              if (res.data.skus.departure_date[i].value.substring(8, 10) >= this.data.nowDay) {
                date = new Date(res.data.skus.departure_date[i].value);
                this.setData({
                  departure_date: this.getdate(date),
                  departure_date_: res.data.skus.departure_date[i].value,
                });
                break;
              };
            } else {
              date = new Date(res.data.skus.departure_date[i].value);
              this.setData({
                departure_date: this.getdate(date),
                departure_date_: res.data.skus.departure_date[i].value,
              });
              break;
            };
          };
        };

        let outingMonthArr = [];
        for (let i = 0; i < res.data.skus.departure_date.length; i++) {
          let dates = new Date(res.data.skus.departure_date[i].value);
          outingMonthArr[i] = this.getdate(dates);
        };

        console.log(outingMonthArr);

        this.setData({
          outingMonthArr: outingMonthArr,
          selDayNum: this.getdate(date).substring(8, 10)
        });
        console.log(this.data.departure_date);
        console.log(this.data.departure_date_);

        //有大于当前日期的数据，就刷新
        for (let i = 0; i < outingMonthArr.length; i++) {
          if (outingMonthArr[i].substring(5, 7) >= this.data.nowMonth) {
            if (outingMonthArr[i].substring(5, 7) > this.data.nowMonth) {
              this.getSkuInfo();
              break;
            } else {
              if (outingMonthArr[i].substring(8, 10) >= this.data.nowDay) {
                this.getSkuInfo();
                break;
              }
            }
          };
        };

        for (let i = 0; i < outingMonthArr.length; i++) {
          if (outingMonthArr[i].substring(5, 7) <= this.data.nowMonth ) { 
            if (outingMonthArr[i].substring(5, 7) == this.data.nowMonth) {
              if ((outingMonthArr[i].substring(8, 10) < this.data.nowDay)) {
                this.setData({
                  isNoDay: true
                });
              } else {
                this.setData({
                  isNoDay: false
                });
                break;
              };
            } else {
              this.setData({
                isNoDay: true
              });
            };
          } else {
            this.setData({
              isNoDay: false
            });
            break;
          };
        };

        // this.getSkuInfo();

        this.getOutingData();
        this.getCalendar(this.data.selMonthNum);

      } else {
        this.data.ticket_type == 1 ? this.setData({ ticket_type: 2 }) : this.setData({ ticket_type: 1 });

        this.getSkuInfo();
      };
    };

    this.amountCount();
  },

  //出游数据
  getOutingData() {
    let obj = this.data.outingData;
    let outingMonthArr = this.data.outingMonthArr;
    let datePricesArr = this.data.datePrices;
    let outingDataArry = [];

    console.log(outingMonthArr);
    let adultPrice = this.data.adultPrice;
    let childPrice = this.data.childPrice;

    if (this.data.type == '0') {
      if (adultPrice != '0' && adultPrice != '') {
        adultPrice = this.calculateSub(this.data.adultPrice, this.data.less);
      } else {
        adultPrice = this.data.adultPrice;
      };
      if (childPrice != '0' && childPrice != '') {
        childPrice = this.calculateSub(this.data.childPrice, this.data.less);
      } else {
        childPrice = this.data.childPrice;
      };
    };
    console.log('datePricesArr::::', datePricesArr);
    console.log(datePricesArr.length);
    if (this.data.type == '0') {
      for (let i = 0; i < datePricesArr.length; i++) {
        outingDataArry.push({
          adultPrice: (datePricesArr[i].adultPrice != '0' && datePricesArr[i].adultPrice != '') ? this.calculateSub(datePricesArr[i].adultPrice, this.data.less) : datePricesArr[i].adultPrice,
          childPrice: (datePricesArr[i].childPrice != '0' && datePricesArr[i].childPrice != '') ? this.calculateSub(datePricesArr[i].childPrice, this.data.less) : datePricesArr[i].childPrice,
          adultNum: this.data.adultNum,
          childNum: this.data.childNum,
          year: datePricesArr[i].date.substring(0, 4),
          month: datePricesArr[i].date.substring(5, 7),
          day: datePricesArr[i].date.substring(8, 10),
        });
      };
    } else {
      for (let i = 0; i < datePricesArr.length; i++) {
        outingDataArry.push({
          adultPrice: datePricesArr[i].adultPrice,
          childPrice: datePricesArr[i].childPrice,
          adultNum: this.data.adultNum,
          childNum: this.data.childNum,
          year: datePricesArr[i].date.substring(0, 4),
          month: datePricesArr[i].date.substring(5, 7),
          day: datePricesArr[i].date.substring(8, 10),
        });
      };
    };

    this.setData({
      outingDataArry,
      isLoad: true
    });

    console.log(this.data.outingDataArry);
  },

  //选择月份
  selMonthTab(e) {
    this.setData({
      selMonthNum: e.target.dataset.index
    });
    console.log('当前月份index', this.data.selMonthNum);
    this.getCalendar(e.target.dataset.index);

    this.selMonthData();
  },

  selMonthData() {
    console.log(this.data.days);

    console.log('是否有outingDataArry', this.data.days[0].outingDataArry != undefined);

    for (let i = 0; i < this.data.days.length; i++) {
      if (this.data.days[i].outingDataArry != undefined) {
        if ((this.data.days[i].outingDataArry.month >= this.data.nowMonth) && (this.data.days[i].outingDataArry.adultPrice || this.data.days[i].outingDataArry.childPrice)) {
          if (this.data.days[i].outingDataArry.month == this.data.nowMonth) {
            if (this.data.days[i].outingDataArry.day >= this.data.nowDay) {
              let departure_date = this.data.days[i].outingDataArry.year + '' + this.data.days[i].outingDataArry.month + '' + this.data.days[i].outingDataArry.day;

              let departure_date_ = this.data.days[i].outingDataArry.year + '-' + this.data.days[i].outingDataArry.month + '-' + this.data.days[i].outingDataArry.day;
              this.setData({
                selDayNum: i + 1,
                departure_date: departure_date, //出发日期
                departure_date_: departure_date_,
              });
              break;
            };
          } else {
            let departure_date = this.data.days[i].outingDataArry.year + '' + this.data.days[i].outingDataArry.month + '' + this.data.days[i].outingDataArry.day;

            let departure_date_ = this.data.days[i].outingDataArry.year + '-' + this.data.days[i].outingDataArry.month + '-' + this.data.days[i].outingDataArry.day;
            this.setData({
              selDayNum: i + 1,
              departure_date: departure_date, //出发日期
              departure_date_: departure_date_,
            });
            break;
          };

        };
      };
    };
    console.log('当前选中日期:::', this.data.departure_date);
    console.log('当前选中日期:::', this.data.departure_date_);
    this.getSkuInfo();
  },

  //preBtn按钮 
  preBtn() {
    let selMonthNum = this.data.selMonthNum;
    console.log('当前月份index', this.data.selMonthNum);

    for (let i = 0; i < this.data.outingMonthList.length; i++) {
      if (this.data.nowMonth == this.data.outingMonthList[i].month) {
        this.setData({
          minMonth: i
        });
        break;
      };
    };

    if (selMonthNum == this.data.minMonth) {
      return;
    } else {
      selMonthNum--;

      this.setData({
        selMonthNum
      });
      this.getCalendar(selMonthNum);
      this.selMonthData();
    }
  },

  //nextBtn按钮
  nextBtn() {
    let selMonthNum = this.data.selMonthNum;
    console.log('当前月份index', this.data.selMonthNum);
    console.log('所有月份', this.data.outingMonthList);
    console.log('月份的长度', this.data.outingMonthList.length);
    if (selMonthNum == this.data.outingMonthList.length - 1 || selMonthNum > this.data.outingMonthList.length - 1) {
      return;
    } else {
      selMonthNum++;

      this.setData({
        selMonthNum
      });
      this.getCalendar(selMonthNum);
      this.selMonthData();
    }
  },

  //选择出游日期
  selOutingDate(e) {
    let departure_date = e.target.dataset.year + '' + (e.target.dataset.month > 9 ? e.target.dataset.month : '0' + e.target.dataset.month) + '' + (e.target.dataset.day > 9 ? e.target.dataset.day : '0' + e.target.dataset.day);

    let departure_date_ = e.target.dataset.year + '-' + (e.target.dataset.month > 9 ? e.target.dataset.month : '0' + e.target.dataset.month) + '-' + (e.target.dataset.day > 9 ? e.target.dataset.day : '0' + e.target.dataset.day);

    this.setData({
      selDayNum: e.target.dataset.day,
      departure_date: departure_date,
      departure_date_: departure_date_,
      adultNum: e.target.dataset.num,
      childNum: e.target.dataset.cnum
    });

    console.log(this.data.departure_date);
    console.log(this.data.departure_date_);
    console.log('成人票:::', this.data.adultNum);
    console.log('儿童票:::', this.data.childNum);

    if (this.data.adultNum == 0) {
      this.setData({
        'inputValue[0]': 0
      });
    };

    if (this.data.childNum == 0) {
      this.setData({
        'inputValue[1]': 0
      });
    };

    this.getSkuInfo();
  },

  //出游月份列表
  getOutingMonth() {
    const outingMonthList = [];
    const outingMonth = this.data.outingMonthArr;
    const outingMonth_arr = [];
    const getoutingMonthArr = [];

    for (let i = 0; i < outingMonth.length; i++) {
      outingMonth_arr[i] = outingMonth[i].split("-").join("");
    };

    console.log('处理日期月份:', outingMonth_arr);

    //截取掉日期，留年月做判断
    for (let i = 0; i < outingMonth_arr.length; i++) {
      getoutingMonthArr[i] = outingMonth_arr[i].substring(0, 6);
    };


    console.log('去重后:', this.uniq(getoutingMonthArr));

    for (let i = 0; i < this.uniq(getoutingMonthArr).length; i++) {
      if (i == this.uniq(getoutingMonthArr).length - 1) {
        if (this.uniq(getoutingMonthArr)[i].substring(4, 6) < this.data.nowMonth) {
          outingMonthList.push({
            year: this.data.nowYear,
            month: this.data.nowMonth
          });
        } else {
          outingMonthList.push({
            year: this.uniq(getoutingMonthArr)[i].substring(0, 4),
            month: this.uniq(getoutingMonthArr)[i].substring(4, 6)
          });
        };
      } else {
        outingMonthList.push({
          year: this.uniq(getoutingMonthArr)[i].substring(0, 4),
          month: this.uniq(getoutingMonthArr)[i].substring(4, 6)
        });
      };
    };

    this.setData({
      outingMonthList
    });

    console.log(outingMonthList);

    return outingMonthList;
  },

  //数组去重
  uniq(array) {
    var temp = []; //一个新的临时数组
    for (var i = 0; i < array.length; i++) {
      if (temp.indexOf(array[i]) == -1) {
        temp.push(array[i]);
      }
    }
    return temp;
  },

  //当月日历数据渲染
  getCalendar(num) {
    // console.log('所有月份:', this.getOutingMonth());
    const outingMonthList = this.getOutingMonth();
    const cur_year = parseInt(outingMonthList[num].year); //现在年份
    const cur_month = parseInt(outingMonthList[num].month); //当月
    // console.log(cur_year, cur_month);
    this.getCalendarData(cur_year, cur_month);
  },

  //当月日历数据
  getCalendarData(cur_year, cur_month) {
    const cur_last_month = parseInt(parseInt(cur_month) - 1); //上个月
    const cur_next_month = parseInt(parseInt(cur_month) + 1); //下个月

    this.calculateEmptyGrids(cur_year, cur_month); //当月置空数
    this.calculateDays(cur_year, cur_month); //当月所有天数

    this.getLastMonthDays(cur_year, cur_last_month, cur_month); //上个月最后几天-天数
    this.getNextMonthDays(cur_year, cur_month, cur_next_month); //下个月前几天-天数

    this.setData({
      cur_year,
      cur_month
    });
  },

  //当月总天数
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },

  //当月第一天在周几
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },

  //当月第一天在周几-前几天置空
  calculateEmptyGrids(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },

  //获取当月天数列表
  calculateDays(year, month) {
    let days = [];
    let hasTicksDay = [];
    let outingDataArry = this.data.outingDataArry;
    const thisMonthDays = this.getThisMonthDays(year, month);//获取的当月总天数

    for (let i = 1; i <= thisMonthDays; i++) {
      days.push({
        month: month,
        day: i,
        choosed: false,
      });
    };

    // console.log('当前月份索引', this.data.selMonthNum);

    console.log(outingDataArry);

    //获取有票的日期 - 只显示当月
    for (let j = 0; j < outingDataArry.length; j++) {
      for (let i = 1; i <= thisMonthDays; i++) {
        if (this.data.outingMonthList[this.data.selMonthNum].year == outingDataArry[j].year && this.data.outingMonthList[this.data.selMonthNum].month == outingDataArry[j].month) {
          if (month == outingDataArry[j].month && i == outingDataArry[j].day) {
            days[i - 1] = {
              outingDataArry: outingDataArry[j],
              month: month,
              day: i,
              choosed: false,
            };
          };
        };
      }
    };

    this.setData({
      days
    });

    console.log(this.data.days);
  },

  //获取上一个月最后几天
  getLastMonthDays(year, month, cur_now_month) {
    const lastDaysNum = this.getFirstDayOfWeek(year, cur_now_month); //获取上个月的最后几天的天数

    let lastMonthDays = [];

    const thisMonthDays = this.getThisMonthDays(year, month); //获取的当月总天数

    for (let i = 1; i <= thisMonthDays; i++) {
      lastMonthDays.push({
        day: i,
        choosed: false
      });
    };
    lastMonthDays = lastMonthDays.slice(thisMonthDays - lastDaysNum); //截取上个月的最后几天
    this.setData({
      lastMonthDays
    });
  },

  //获取下一个月的头几天-置空 
  getNextMonthDays(year, month, cur_next_month) {
    const nextDaysNum = this.getFirstDayOfWeek(year, cur_next_month); //获取下个月的第一天在周几
    const nextDaysNums = 7 - nextDaysNum; //得到下个月前几天的天数
    let nextMonthDays = [];

    if (nextDaysNum > 0) {
      for (let i = 0; i < nextDaysNums; i++) {
        nextMonthDays.push(i);
      }
      this.setData({
        nextMonthDays
      });
    } else {
      this.setData({
        nextMonthDays: []
      });
    }
  },

  //成人-儿童-套餐-加减按钮
  changeGoodCount: function (e) {
    // 代表点击的商品下标
    let _index = e.currentTarget.dataset.index;

    // 代表点击的类型
    let _type = e.currentTarget.dataset.type;

    // 当前商品数据
    let _inputValue = this.data.inputValue;

    // 判断数量是加还是减 sub为减 add为加 当点击为减的时候需判断是否大于1 不大于则不减少
    if (_type == 'sub' && _inputValue[_index] > 0) {
      let _num = _inputValue[_index];
      _num--;
      _inputValue[_index] = _num;
      this.setData({ inputValue: _inputValue });
    } else if (_type == 'add') {
      let _num = _inputValue[_index];
      _num++;
      _inputValue[_index] = _num;
      this.setData({ inputValue: _inputValue });
    };

    this.amountCount();
  },

  //总价
  amountCount() {
    if (this.data.type == '0') {
      let amountAdult = 0;
      if (this.data.adultPrice > 0) {
        amountAdult = this.calculateSub(this.data.adultPrice, this.data.less);
      } else {
        amountAdult = 0;
      };

      //成人价
      if (this.data.inputValue[0] == 0) {
        this.setData({
          amountAdult: 0
        });
      } else {
        this.setData({
          amountAdult: this.calculateMul(amountAdult, this.data.inputValue[0])
        });
      };

      let amountChild = 0;
      if (this.data.childPrice > 0) {
        amountChild = this.calculateSub(this.data.childPrice, this.data.less);
      } else {
        amountChild = 0;
      };

      //儿童价
      if (this.data.inputValue[1] == 0) {
        this.setData({
          amountChild: 0
        });
      } else {
        this.setData({
          amountChild: this.calculateMul(amountChild, this.data.inputValue[1])
        });
      };

    } else {
      this.setData({
        amountAdult: this.calculateMul(this.data.adultPrice, this.data.inputValue[0]),
        amountChild: this.calculateMul(this.data.childPrice, this.data.inputValue[1])
      });
    };

    this.setData({
      amount: this.calculateAdd(this.data.amountAdult, this.data.amountChild),
    });

    console.log('成人价:', this.data.amountAdult);
    console.log('儿童价:', this.data.amountChild);
    console.log('总价:', this.data.amount);
  },

  //浮点数求和
  calculateAdd(a, b) {
    var c, d, e;
    try {
      c = a.toString().split(".")[1].length; //截取成数组
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split(".")[1].length;
    } catch (f) {
      d = 0;
    }
    /*
    *   Math.pow(x, y)为 x 的y次幂；
    */
    return e = Math.pow(10, Math.max(c, d)), (this.calculateMul(a, e) + this.calculateMul(b, e)) / e;
  },

  //浮点数相减
  calculateSub(a, b) {
    var c, d, e;
    try {
      c = a.toString().split(".")[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split(".")[1].length;
    } catch (f) {
      d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (this.calculateMul(a, e) - this.calculateMul(b, e)) / e;
  },

  //浮点数相乘
  calculateMul(a, b) {
    var c = 0,
      d = a.toString(),
      e = b.toString();
    try {
      c += d.split(".")[1].length;
    } catch (f) { }
    try {
      c += e.split(".")[1].length;
    } catch (f) { }
    return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
  },

  //立即购买
  buyTicket() {
    console.log('立即购买');

    if (this.data.adultNum != 0 && this.data.childNum == 0 && this.data.inputValue[0] == 0) {
      this.tipsAlert('请选择票数');
    } else if (this.data.adultNum != 0 && this.data.childNum != 0 && this.data.inputValue[0] == 0 && this.data.inputValue[1] == 0) {
      this.tipsAlert('请选择票数');
    } else if (this.data.adultNum == 0 && this.data.childNum != 0 && this.data.inputValue[1] == 0) {
      this.tipsAlert('请选择票数');
    } else {
      console.log('当前选择成人票:', this.data.inputValue[0]);
      console.log('当前选择儿童票:', this.data.inputValue[1]);
      console.log('规格id', this.data.productNormId);
      app.dataGet({
        url: 'rest/product/inventoryJudge?productNormId=' + this.data.productNormId + '&adultNum=' + this.data.inputValue[0] + '&childrenNum=' + this.data.inputValue[1], success: this.inventoryJudge
      });
    };
  },

  //判断是否有库存
  inventoryJudge(res) {
    console.log(res);
    if (res.data.status == '100005') {
      this.tipsAlert(res.data.msg);
    } else {
      if (this.data.is_first_action) {
        this.setData({
          is_first_action: false
        });

        let url = '../confirmOrder/confirmOrder?type=' + this.data.type + '&adult=' + this.data.inputValue[0] + '&child=' + this.data.inputValue[1] + '&id=' + this.data.productNormId + '&order=' + JSON.stringify(this.data.order) + '&adultprice=' + this.data.adultPrice + '&childprice=' + this.data.childPrice + '&shopid=' + this.data.shopid + '&formid=' + this.data.userFormId + '&departuredate=' + this.data.departure_date_ + '&meal=' + this.data.meal + '&departure=' + this.data.departure_;

        this.enterPage(url);
      };
    };
  },

  //提示弹窗
  tipsRule() {
    this.setData({
      tipShow: !this.data.tipShow
    });
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
  * 进入页面
  */
  enterPage(url) {
    let _this = this;
    if (url)
      wx.redirectTo({
        url: url,
        success: function (res) {
          _this.setData({
            is_first_action: true
          });
        }
      })
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
    this.setData({
      selMonthNum: 0
    });
    this._load();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})