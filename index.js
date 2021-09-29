const Redis = require("ioredis");
const redis = new Redis();
// redis.set("foo", "bar"); // returns promise which resolves to string, "OK"
var {
    traModule,
    stuModule
} = require("./db")

function judge(result) {
    if (result === 0) {
        return false
    }
    return true
}
const amqp = require('amqplib');

// async function product(msg, key) {
//     // 1. 创建链接对象
//     const connection = await amqp.connect('amqp://localhost:5672');

//     // 2. 获取通道
//     const channel = await connection.createChannel();

//     // 3. 声明参数
//     const routingKey = key;
//     const exchangeName = 'direct_kaola_exchange'

//     // 4. 声明交换机
//     await channel.assertExchange(exchangeName, 'direct', {
//         durable: true,
//     });

//     // 5. 发送消息
//     await channel.publish(exchangeName, routingKey, Buffer.from(msg));

//     // 6. 关闭通道
//     await channel.close();
//     // 7. 关闭连接
//     await connect.close()
// }
async function product(msg, key) {
    const testExchange = 'testEx';
    const testQueue = 'testQu';
    const testExchangeDLX = 'testExDLX';
    const testRoutingKeyDLX = 'testRoutingKeyDLX';
    const connection = await amqp.connect('amqp://localhost:5672')
    const ch = await connection.createChannel();
    await ch.assertExchange(testExchange, 'direct', {
        durable: true
    });
    const queueResult = await ch.assertQueue(testQueue, {
        exclusive: false,
        deadLetterExchange: testExchangeDLX,
        deadLetterRoutingKey: testRoutingKeyDLX,
    });
    await ch.bindQueue(queueResult.queue, testExchange, key);
    console.log('producer msg：', msg);
    await ch.sendToQueue(queueResult.queue, Buffer.from(msg), {
        expiration: '100000'
    });
    await connection.close();
    await ch.close();
}

async function consumerDLX() {
    const testExchangeDLX = 'testExDLX';
    const testRoutingKeyDLX = 'testRoutingKeyDLX';
    const testQueueDLX = 'testQueueDLX';
    const connection = await amqp.connect('amqp://localhost:5672')
    const ch = await connection.createChannel();
    await ch.assertExchange(testExchangeDLX, 'direct', {
        durable: true
    });
    const queueResult = await ch.assertQueue(testQueueDLX, {
        exclusive: false,
    });
    await ch.bindQueue(queueResult.queue, testExchangeDLX, testRoutingKeyDLX);
    await ch.consume(queueResult.queue, msg => {
        console.log('consumer msg：', msg.toString());
        redis.get("num", function (err, res) {
            if (err) {
                console.log(err)
            }
            redis.set("num", result++);
        });
    }, {
        noAck: true
    });
}
consumerDLX()



async function consumer(key, cb) {
    // 创建链接对象
    const connection = await amqp.connect('amqp://localhost:5672');
    // 获取通道
    const channel = await connection.createChannel();
    // 声明参数
    const exchangeName = 'testEx';
    const queueName = 'testcs';
    const routingKey = key;
    // 声明一个交换机
    await channel.assertExchange(exchangeName, 'direct', {
        durable: true
    });
    // 声明一个队列
    const queueResult = await channel.assertQueue(queueName);
    // 绑定关系（队列、交换机、路由键）
    await channel.bindQueue(queueResult.queue, exchangeName, routingKey);
    // 消费
    await channel.consume(queueName, msg => {
        cb(msg)
        channel.ack(msg);
    });
    console.log('消费端启动成功！');
}

async function consumerOnce(key) {
    // 创建链接对象
    const connection = await amqp.connect('amqp://localhost:5672');
    // 获取通道
    const channel = await connection.createChannel();
    // 声明参数
    const exchangeName = 'testEx';
    const queueName = 'testcs';
    const routingKey = key;
    // 声明一个交换机
    await channel.assertExchange(exchangeName, 'direct', {
        durable: true
    });
    // 声明一个队列
    const queueResult = await channel.assertQueue(queueName);
    // 绑定关系（队列、交换机、路由键）
    await channel.bindQueue(queueResult.queue, exchangeName, routingKey);
    // 消费
    await channel.consume(queueName, msg => {
        await channel.close();
        await connection.close();
        channel.ack(msg);
    });



}
var express = require('express');
var app = express();
app.post('/secondkill', function (req, res) {
    redis.get("num", function (err, result) {
        if (err) {
            console.error(err);
        } else {
            if (result === null) { //这里前往数据库读值，假设他是100
                result = 100
                result--
                redis.set("num", result);
                res.send(result);
            } else {
                if (judge(result)) {
                    redis.set("num", --result);
                    res.send(result);
                    product(req.body, req.body.id)
                } else {
                    res.send('已经卖完了')
                }
            }
        }
    });
})
app.post('/pay', function (req, res) {
    consumerOnce(req.body.id, )
    product(req.body, 'stock')
    product(req.body, 'order')
})


let reduce = async function () {
    await traModule.update({
        name: '水杯'
    }, {
        $inc: {
            num: -1
        }
    })

}
let generate = async function (msg) {
    await stuModule.create(msg)

}
consumer('stock', reduce)
consumer('order', generate)