process.on('unhandledRejection', (reason, p) => {
  console.warn(`${p} - ${reason}`)
});
process.on('rejectionHandled', (p) => {
    console.warn(p);
});

var discord = require('discord.js');
var c = new discord.Client();
var cargs = require('node-args-parser')(process.argv);
var config = require('./config.json');

if(!cargs.token) {
    console.error('Токен необходим');
    process.exit();
}

function setup(data, type) {
    if(type == 'MessageEmbed') {
        if(!data.title) data.title = '';
        if(!data.description) data.description = '';
        if(!data.author) data.author = {name: '', iconURL: '', url: ''};
        if(!data.fields) data.fields = []
        if(!data.thumbnail) data.thumbnail = {url: ''};
        if(!data.image) data.image = {url: ''};
        if(!data.footer) data.footer = {text: info, iconURL: ''};
        return data;
    }
}

function f(string) { return string.replace(/`/g, "`" + String.fromCharCode(8203)); }
var info = 'Logger-Bot v1.0.3';
var NULL = '\u200b';

function Handler(msgs, event) {
    if(config[msgs[0].guild.id]) {
        var embed = new discord.RichEmbed();
        var me = setup(msgs[0].embeds[0] || {}, 'MessageEmbed');
        
        embed.setTitle(me.title || '');
        embed.setDescription(me.description || '');
        embed.setURL(me.url);
        embed.setColor(me.color);
        embed.setAuthor(me.author.name || '', me.author.iconURL, me.author.url);
        embed.setTimestamp(me.timestamp);
        for (var i=0;i!==me.fields.length;i++) {
            embed.addField(me.fields[i].name, me.fields[i].value, me.fields[i].inline);
        }
        embed.setThumbnail(me.thumbnail.url);
        embed.setImage(me.image.url);
        embed.setFooter(me.footer.text || info, me.footer.iconURL || '');
        
        var attachments = '';
        msgs[0].attachments.forEach((attachment) => {
            attachments += `${attachment.url} `;
        });
        
        var res;
        if(event == 0) res = `Удалено сообщение от ${msgs[0].author.tag}, ID сообщения: ${msgs[0].id}\n\`\`\`${f(msgs[0].content)}\`\`\`\nВсе изображения: ${attachments}\nEmbed:`;
        if(event == 1) res = `Изменено сообщение от ${msgs[0].author.tag}, ID сообщения: ${msgs[0].id}\nДо:\n\`\`\`${f(msgs[0].content)}\`\`\`\nПосле:\n\`\`\`${f(msgs[1].content)}\`\`\`\nВсе изображения: ${attachments}\nEmbed до изменения сообщения:`;
        c.channels.get(config[msgs[0].guild.id]['log']).send(res, {embed: embed});
    }
}

c.on('ready', async () => {
    author = await c.fetchUser('321268938728144906');
    c.user.setPresence({game: {name: info, type: 0}});
    console.log(`Клиент загружен.\nИмя бота: ${c.user.tag}\nАвтор клиента: ${author.tag}`);
});

c.on('messageDelete', async msg => {
    if(msg.author.bot) return;
    Handler([msg], 0);
});

c.on('messageUpdate', async (_1, _2) => {
    if(_1.author.bot) return;
    Handler([_1, _2], 1);
});

c.login(cargs.token);