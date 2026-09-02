// 卧底找茬词库：[平民词, 卧底词] —— 两个词必须「相近但不同」，
// 描述时既容易撞车又容易露馅，这是游戏乐趣的来源。
// 编写原则：
//   1. 同一词对不同时出现两次
//   2. 避免生僻词，聚会场景要人人认识
//   3. 卧底词不能是平民词的上位/下位概念（如「苹果/水果」会让卧底秒赢），必须是并列关系
//   4. 避免只有一个字之差（如「可乐/可恶」）造成听觉混淆

export interface WordPair {
  category: string
  a: string
  b: string
}

export const WORD_PAIRS: WordPair[] = [
  // 饮品食物
  { category: '吃喝', a: '可乐', b: '雪碧' },
  { category: '吃喝', a: '奶茶', b: '咖啡' },
  { category: '吃喝', a: '火锅', b: '烧烤' },
  { category: '吃喝', a: '包子', b: '饺子' },
  { category: '吃喝', a: '面条', b: '米线' },
  { category: '吃喝', a: '蛋糕', b: '面包' },
  { category: '吃喝', a: '冰淇淋', b: '棒棒糖' },
  { category: '吃喝', a: '西瓜', b: '冬瓜' },
  { category: '吃喝', a: '草莓', b: '樱桃' },
  { category: '吃喝', a: '薯条', b: '薯片' },
  { category: '吃喝', a: '豆浆', b: '牛奶' },
  { category: '吃喝', a: '啤酒', b: '白酒' },
  { category: '吃喝', a: '披萨', b: '煎饼' },
  { category: '吃喝', a: '寿司', b: '饭团' },
  { category: '吃喝', a: '月饼', b: '饼干' },
  { category: '吃喝', a: '粥', b: '汤' },
  { category: '吃喝', a: '辣椒', b: '花椒' },
  { category: '吃喝', a: '蜂蜜', b: '白糖' },
  { category: '吃喝', a: '口香糖', b: '薄荷糖' },
  { category: '吃喝', a: '烤鸭', b: '烧鸡' },

  // 日常用品
  { category: '日常', a: '牙刷', b: '梳子' },
  { category: '日常', a: '毛巾', b: '浴巾' },
  { category: '日常', a: '雨伞', b: '太阳伞' },
  { category: '日常', a: '镜子', b: '玻璃' },
  { category: '日常', a: '拖鞋', b: '凉鞋' },
  { category: '日常', a: '围巾', b: '领带' },
  { category: '日常', a: '手套', b: '袜子' },
  { category: '日常', a: '书包', b: '手提包' },
  { category: '日常', a: '台灯', b: '手电筒' },
  { category: '日常', a: '沙发', b: '床' },
  { category: '日常', a: '冰箱', b: '洗衣机' },
  { category: '日常', a: '空调', b: '电风扇' },
  { category: '日常', a: '微波炉', b: '烤箱' },
  { category: '日常', a: '闹钟', b: '手表' },
  { category: '日常', a: '钥匙', b: '门卡' },
  { category: '日常', a: '纸巾', b: '湿巾' },
  { category: '日常', a: '水杯', b: '保温杯' },
  { category: '日常', a: '枕头', b: '抱枕' },
  { category: '日常', a: '蜡烛', b: '灯笼' },
  { category: '日常', a: '剪刀', b: '菜刀' },

  // 交通出行
  { category: '出行', a: '自行车', b: '电动车' },
  { category: '出行', a: '地铁', b: '公交' },
  { category: '出行', a: '出租车', b: '网约车' },
  { category: '出行', a: '高铁', b: '飞机' },
  { category: '出行', a: '轮船', b: '游艇' },
  { category: '出行', a: '红绿灯', b: '路牌' },
  { category: '出行', a: '安全带', b: '安全帽' },
  { category: '出行', a: '加油站', b: '充电站' },
  { category: '出行', a: '停车场', b: '车库' },
  { category: '出行', a: '斑马线', b: '人行天桥' },
  { category: '出行', a: '方向盘', b: '车钥匙' },
  { category: '出行', a: '地图', b: '指南针' },

  // 数码科技
  { category: '数码', a: '耳机', b: '音箱' },
  { category: '数码', a: '键盘', b: '鼠标' },
  { category: '数码', a: '充电宝', b: '充电器' },
  { category: '数码', a: '相机', b: '摄像机' },
  { category: '数码', a: '平板', b: '笔记本电脑' },
  { category: '数码', a: '路由器', b: '交换机' },
  { category: '数码', a: 'U盘', b: '移动硬盘' },
  { category: '数码', a: '投影仪', b: '电视' },
  { category: '数码', a: '自拍杆', b: '三脚架' },
  { category: '数码', a: '验证码', b: '密码' },
  { category: '数码', a: '朋友圈', b: '微博' },
  { category: '数码', a: '直播', b: '短视频' },

  // 娱乐休闲
  { category: '娱乐', a: '电影院', b: '剧场' },
  { category: '娱乐', a: 'KTV', b: '酒吧' },
  { category: '娱乐', a: '游乐园', b: '动物园' },
  { category: '娱乐', a: '麻将', b: '扑克' },
  { category: '娱乐', a: '象棋', b: '围棋' },
  { category: '娱乐', a: '篮球', b: '排球' },
  { category: '娱乐', a: '羽毛球', b: '乒乓球' },
  { category: '娱乐', a: '游泳', b: '潜水' },
  { category: '娱乐', a: '滑雪', b: '滑冰' },
  { category: '娱乐', a: '跳绳', b: '跑步' },
  { category: '娱乐', a: '瑜伽', b: '健身' },
  { category: '娱乐', a: '露营', b: '野餐' },
  { category: '娱乐', a: '吉它', b: '钢琴' },
  { category: '娱乐', a: '演唱会', b: '音乐节' },
  { category: '娱乐', a: '小说', b: '漫画' },

  // 动物植物
  { category: '自然', a: '猫', b: '老虎' },
  { category: '自然', a: '狗', b: '狼' },
  { category: '自然', a: '兔子', b: '袋鼠' },
  { category: '自然', a: '企鹅', b: '北极熊' },
  { category: '自然', a: '章鱼', b: '乌贼' },
  { category: '自然', a: '蝴蝶', b: '蜜蜂' },
  { category: '自然', a: '乌龟', b: '螃蟹' },
  { category: '自然', a: '大象', b: '河马' },
  { category: '自然', a: '长颈鹿', b: '斑马' },
  { category: '自然', a: '向日葵', b: '蒲公英' },
  { category: '自然', a: '玫瑰', b: '月季' },
  { category: '自然', a: '仙人掌', b: '芦荟' },
  { category: '自然', a: '竹子', b: '甘蔗' },
  { category: '自然', a: '蘑菇', b: '木耳' },

  // 职业人物
  { category: '人物', a: '医生', b: '护士' },
  { category: '人物', a: '老师', b: '教授' },
  { category: '人物', a: '警察', b: '保安' },
  { category: '人物', a: '厨师', b: '服务员' },
  { category: '人物', a: '律师', b: '法官' },
  { category: '人物', a: '司机', b: '飞行员' },
  { category: '人物', a: '理发师', b: '化妆师' },
  { category: '人物', a: '快递员', b: '外卖员' },
  { category: '人物', a: '消防员', b: '救生员' },
  { category: '人物', a: '作家', b: '记者' },
  { category: '人物', a: '导演', b: '演员' },
  { category: '人物', a: '老板', b: '员工' },

  // 场所地点
  { category: '地点', a: '医院', b: '药店' },
  { category: '地点', a: '学校', b: '图书馆' },
  { category: '地点', a: '超市', b: '便利店' },
  { category: '地点', a: '银行', b: '邮局' },
  { category: '地点', a: '公园', b: '广场' },
  { category: '地点', a: '电梯', b: '扶梯' },
  { category: '地点', a: '阳台', b: '窗户' },
  { category: '地点', a: '厨房', b: '卫生间' },
  { category: '地点', a: '健身房', b: '游泳馆' },
  { category: '地点', a: '机场', b: '火车站' },

  // 抽象与时间
  { category: '抽象', a: '初恋', b: '暗恋' },
  { category: '抽象', a: '加班', b: '熬夜' },
  { category: '抽象', a: '工资', b: '奖金' },
  { category: '抽象', a: '考试', b: '面试' },
  { category: '抽象', a: '暑假', b: '寒假' },
  { category: '抽象', a: '生日', b: '婚礼' },
  { category: '抽象', a: '童年', b: '青春期' },
  { category: '抽象', a: '梦想', b: '目标' },
  { category: '抽象', a: '回忆', b: '幻想' },
  { category: '抽象', a: '后悔', b: '遗憾' },
  { category: '抽象', a: '运气', b: '实力' },
  { category: '抽象', a: '普通话', b: '方言' },

  // 天气自然现象
  { category: '天气', a: '下雨', b: '下雪' },
  { category: '天气', a: '彩虹', b: '极光' },
  { category: '天气', a: '台风', b: '龙卷风' },
  { category: '天气', a: '雷电', b: '闪电' },
  { category: '天气', a: '沙漠', b: '草原' },
  { category: '天气', a: '大海', b: '湖泊' },
  { category: '天气', a: '日出', b: '日落' },
  { category: '天气', a: '春天', b: '秋天' },
]

/** 供运行时去重检索 */
export const WORD_PAIR_CATEGORIES = Array.from(new Set(WORD_PAIRS.map((p) => p.category)))
