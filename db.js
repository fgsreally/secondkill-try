var mongoose = require('mongoose')
var Schema = mongoose.Schema;
//连接数据库
mongoose.connect('mongodb://localhost:27017/trade', {
    useNewUrlParser: true
})


//创建Schema对象（约束）
var status = new Schema({
    name: String,
    age: Number,
    gender: {
        type: String,
        default: 'male'
    },
    addr: String
})

//将stuSchema映射到一个MongoDB collection并定义这个文档的构成
var stuModle = mongoose.model('status', status)
//创建Schema对象（约束）
var trade = new Schema({
    name:String,
    num: Number
})

//将stuSchema映射到一个MongoDB collection并定义这个文档的构成
var traModle = mongoose.model('trade', trade)

traModle.create({
    name:'水杯',
    num:100
}, (err, docs) => {
    if (!err) {
        console.log('插入成功' + docs)
    }
})
module.exports={traModle,stuModle}