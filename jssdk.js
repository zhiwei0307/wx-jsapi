const Koa = require('koa');
const Jsapi = require('./Jsapi');
const app = new Koa();

const config = {
    appId: 'wx0f0810fd20a057b1',
    appsecret: '03e51c5eea9ce608757b0887f99e8ead',
}
app.use(async(ctx, next) => {
    console.time('calculate time:');
    if (ctx.request.path == '/favicon.ico') { return; }

    let sdk = new Jsapi(config.appId, config.appsecret);
    // let accessTokenPromise = sdk.access_token();
    // let jsapiTicketPromise = sdk.jsapi_ticket();
    // let signPromise = sdk.sign('url');//url 需动态获取；
    // let access_token = await accessTokenPromise;
    // let jsapi_ticket = await jsapiTicketPromise;
    // let sign = await signPromise;
    let access_token = await sdk.access_token();
    let jsapi_ticket = await sdk.jsapi_ticket();
    let sign = await sdk.sign('url');//url 需动态获取；
    sign = JSON.stringify(sign);
    console.timeEnd('calculate time:');
    ctx.response.type = 'html';
    ctx.response.body = `
        <p>access_token :${access_token}</p>
        <p>jsapi_ticket :${jsapi_ticket}</p>
        <p>sign :${sign}</p>`;
})

app.listen(3001, () => {
    console.log('[demo] running at port:3001');
})