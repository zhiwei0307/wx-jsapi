/**
 * TIME: 2018/2/1 11:27;
 * 微信公众号 access_token、jsapi_ticket、signature 获取类；
 * 类里面使用 ES7 async / await, 请确保node 运行环境支持； 
 * @param fs 读取或写入文件模块；
 * @param crypto 加密模块；
 * @param request 获取链接网页内容 模块；
 * 
 * @param sign() 加密算法获取 signature 签名，同时返回签名和 获取签名的数据；
 * @param access_token() 得到 access_token 数据；
 * @param jsapi_ticket() 得到 jsapi_ticket 数据；
 * 
 */

const fs = require('fs');
const crypto = require('crypto');
const request = require('request');

class Jsapi {

    constructor(appId, appsecret) {
        this.appId = appId;
        this.appsecret = appsecret;
    }

    /**
     * 获取 jsapi_ticket;
     */
    async jsapi_ticket() {
        let data = this.get_data('./jsapi_ticket.txt');
        let jsapi_ticket, now = new Date();
        if (!data || data.expires_in < now.getTime()) {
            jsapi_ticket = await this.get_jsapi_ticket();
        } else {
            jsapi_ticket = data.ticket;
        }
        return jsapi_ticket;
    }

    /**
     * 获取 jsapi_ticket 同时保存到文件；
     */
    async get_jsapi_ticket() {
        let access_token = await this.access_token();
        let getAccessTokenUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`;
        let content = await this.get_http_data(getAccessTokenUrl); // 获取链接 网页中内容；

        let jsapi_ticket = content.ticket;
        this.save_data(content, './jsapi_ticket.txt');
        return jsapi_ticket;
    }

    //接收获取的 access_token;
    async access_token() {
        let data = this.get_data('./access_token.txt');
        let accessToken, now = new Date();

        if (!data || data.expires_in < now.getTime()) {
            accessToken = await this.get_access_token();
        } else {
            accessToken = data.access_token;
        }
        return accessToken;
    }

    /**
     * 获取 access_token 同时保存到文件；
     */
    async get_access_token() {
        let getAccessTokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appsecret}`;
        let content = await this.get_http_data(getAccessTokenUrl); // 获取连接内容；

        let access_token = content.access_token;
        this.save_data(content, './access_token.txt');
        return access_token;
    }

    /**
     * 获取链接网页中数据 （request异步读取网页中内容）;
     * @param url 网页链接；
     */
    get_http_data(url) {
        return new Promise((resolve, reject) => {
            request({
                url: url,
                mothod: 'GET',
            }, (err, res, body) => {
                if (err) { return reject(err); }
                let content = JSON.parse(body); //网页内容；
                resolve(content);
            })
        })
    }

    /**
     * 保存数据 到 文件；
     * @param data 要保存的数据；
     * @param filename 要保存的文件名称；
     */
    save_data(data, filename) {
        let nowDate = new Date();
        data.expires_in = nowDate.getTime() + 7000 * 1000;
        fs.writeFileSync(filename, JSON.stringify(data), 'utf8');
    }

    /**
     * 读取 文件内 数据；
     * @param filename 要 读取内容的文件名称；
     */
    get_data(filename) {
        if (!fs.existsSync(filename)) {
            return false;
        }
        let data = JSON.parse(fs.readFileSync(filename));
        return data;
    }

    /**
     * 随机字符串；
     */
    createNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    }

    /**
     * 时间戳；
     */
    createTimestamp() {
        return parseInt(new Date().getTime() / 1000) + '';
    }

    /**
     * 参与签名数据 jsapi_ticket、timestamp、nonceStr、url 字典排序；
     *  @param args 将参与签名的对象排序 参数；
     */
    raw(args) {
        let keys = Object.keys(args); //获取json对象 的key值，并存在数组里；
        keys = keys.sort();

        let string = '';
        keys.forEach((val)=>{
            string += '&' + val + '=' + args[val];
        });
        string = string.substr(1);
        return string;
    }

    /**
    * @synopsis 签名算法 
    *
    * @param jsapi_ticket 用于签名的 jsapi_ticket
    * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
    *
    * @returns
    */
    async sign(url) {
        let jsapi_ticket = await this.jsapi_ticket();
        let ret = {
            jsapi_ticket: jsapi_ticket,
            nonceStr: this.createNonceStr(),
            timestamp: this.createTimestamp(),
            url: url
        };
        let string = this.raw(ret);
        let sha1 = crypto.createHash('sha1');
        sha1.update(string);
        ret.signature = sha1.digest('hex');

        return ret;
    };
}

module.exports = Jsapi;