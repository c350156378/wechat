   
var crypto = require('crypto');
var xml=require('node-xml');
 module.exports = function(app){
    　　app.get('/',function(req,res){
           res.render('test',{issuccess:"success"})
        }); 
        app.get('/interface',function(req,res){
    var token="ltshanet";
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var echostr   = req.query.echostr; 
    var nonce     = req.query.nonce;
    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = token;
    oriArray.sort();
    var original = oriArray.join(''); 
    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    var sha1Code = crypto.createHash("sha1");
    var code = sha1Code.update(original,'utf-8').digest("hex");
 
    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if(code===signature){
        res.send(echostr)
    }else{
        res.send("error");
    }
});   
        app.post('/interface',function(req,res){
    var post_data="";
    req.on("data",function(data){post_data=data;});
    req.on("end",function(){
    var xmlStr=post_data.toString('utf-8',0,post_data.length);
    //解析消息代码
    // 定义解析存储变量
    var ToUserName="";
    var FromUserName="";
    var CreateTime="";
    var MsgType="";
    var Content="";
    var tempName="";
    //开始解析消息
    var parse=new xml.SaxParser(function(cb){
        cb.onStartElementNS(function(elem,attra,prefix,uri,namespaces){
             tempName=elem;
        });
        cb.onCharacters(function(chars){
            chars=chars.replace(/(^\s*)|(\s*$)/g, "");
            if(tempName=="CreateTime"){
                CreateTime=chars;
            }
        });
        cb.onCdata(function(cdata){
                if(tempName=="ToUserName"){
                    ToUserName=cdata;
                }else if(tempName=="FromUserName"){
                    FromUserName=cdata;
                }else if(tempName=="MsgType"){
                    MsgType=cdata;
                }else if(tempName=="Content"){
                    Content=cdata;
                }
                console.log(tempName+":"+cdata);
            });
       cb.onEndElementNS(function(elem,prefix,uri){
             tempName="";
       });
       cb.onEndDocument(function(){
              //按收到的消息格式回复消息
       });
    });
     parse.parseString(xmlStr);
    //回发消息代码
var CreateTime=parseInt(new Date().getTime() / 1000);
var msg="";
if(MsgType=="text"){
   msg="谢谢关注,你说的是:"+Content;
   //组织返回的数据包
   var sendMessage='<xml>'+
            '<ToUserName><![CDATA['+FromUserName+']]></ToUserName>'+
           ' <FromUserName><![CDATA['+ToUserName+']]></FromUserName>'+                     
            '<CreateTime>'+CreateTime+'</CreateTime>'+
            '<MsgType><![CDATA[text]]></MsgType>'+
           '<Content><![CDATA['+msg+']]></Content>'+
      '</xml>';
    res.send(sendMessage);
}
});
    });
}
