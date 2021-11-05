var amqp = require('amqplib/callback_api');
// const amqplib = require('amqplib');
var amqpUrl = 'amqp://localhost';
var objectService = require('../services/objectService');

var MQService = {
    
    send: function(queue, msg) {
        logger.log('MQService.send', {type: 'function'});
        amqp.connect(amqpUrl, function(error0, connection) {
            if (error0) {
                throw error0;
            }
            
            connection.createChannel(function(error1, channel) {
                if (error1) {
                    throw error1;
                }
                
                channel.assertQueue(queue, {
                    durable: false
                });

                channel.sendToQueue(queue, Buffer.from(msg));
            });
            
            setTimeout(function() {
                connection.close();
            }, 500);                                        
        });                         
    },
    
    consume: function(queue) {
        logger.log('MQService.consume', {type: 'function'});
        amqp.connect(amqpUrl, function(error0, connection) {
            if (error0) {
                throw error0;
            }
            
            connection.createChannel(function(error1, channel) {
                if (error1) {
                    throw error1;
                }

                channel.assertQueue(queue, {
                    durable: false
                });
                
                // console.log("Waiting for messages in %s.", queue);

                channel.consume(queue, function(msg) {
                    var msgString = msg.content.toString();
                    var m = JSON.parse(msgString);
                    // console.log("Message received: %s", utils.showJSON(m));
                    if (m.action === 'createObject') {
                        objectService.create(m.parameters);
                    }
                }, {
                    noAck: true
                });
            });
        });
    },

    send2: async function(queue, message) {
        console.log("Publishing");
        var connection = await amqplib.connect(amqpUrl, "heartbeat=60");
        var channel = await connection.createChannel();
        // var exch = 'test_exchange';
        // var rkey = 'test_route';
        // await ch.assertExchange(exch, 'direct', {durable: true}).catch(console.error);
        await channel.assertQueue(queue, {durable: true});
        // await ch.bindQueue(q, exch, rkey);
        // await ch.publish(exch, rkey, Buffer.from(msg));
        await channel.sendToQueue(queue, Buffer.from(message));
        setTimeout(function() {
            channel.close();
            connection.close();
        }, 500);
    },
    
    consume2: async function(queue) {
        var connection = await amqplib.connect(amqpUrl, "heartbeat=60");
        var channel = await connection.createChannel();
        await channel.assertQueue(queue, {durable: true});
        await channel.consume(queue, function (message) {
            console.log(message.content.toString());
            channel.ack(message);
            channel.cancel('myconsumer');
            }, {
                consumerTag: 'myconsumer'
            });
            
        setTimeout(function() {
            channel.close();
            connection.close();
        }, 500);
    }
    
};

module.exports = MQService;