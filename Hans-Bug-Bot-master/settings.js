//base by God's Zeal Tech
//re-upload? recode? copy code? give credit ya :)
//YouTube: @AiOFLautech
//Instagram: 
//Telegram: t.me/
//GitHub: @AiOfLautech
//WhatsApp: +2348089336992
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@AiOFLautech
//Also Fork This Bot: https://github.com/AiOfLautech/God-s-Zeal-Xmd

const fs = require('fs')
const chalk = require('chalk')

//contact details
global.ownernomer = "2348089336992"
global.ownername = "*God's Zeal Tech*"
global.ytname = "YT: AiOFLautech"
global.socialm = ""
global.location = "EARTH,AFRICA"

global.ownernumber = '2348089336992'  //creator number
global.ownername = 'Gods Zeal' //owner name
global.botname = '෴⨷ 𝙂𝙊𝘿𝙎𝙕𝙀𝘼𝙇 𝘽𝙐𝙂 𝘽𝙊𝙏 ⨷෴' //name of the bot

//sticker details
global.packname = 'Sticker By Godszeal Tech'
global.author = 'Hello\n\nContact: 2348089336992'

//console view/theme
global.themeemoji = '😎'
global.wm = "God's Zeal Tech😏"

//theme link
global.link = 'https://whatsapp.com/channel/'

//custom prefix
global.prefa = ['','!','.','#','&']

//false=disable and true=enable
global.autoRecording = false //auto recording
global.autoTyping = false //auto typing
global.autorecordtype = false //auto typing + recording
global.autoread = false //auto read messages
global.autobio = false //auto update bio
global.anti92 = false //auto block +92 
global.autoswview = true //auto view status/story

//menu type 
//v1 is image menu, 
//v2 is link + image menu,
//v3 is video menu,
//v4 is call end menu
global.typemenu = 'v1'

//reply messages
global.mess = {
    done: 'Done !',
    prem: 'This feature can be used by premium user only',
    admin: 'This feature can be used by admin only',
    botAdmin: 'This feature can only be used when the bot is a group admin ',
    owner: 'This feature can be used by owner only',
    group: 'This feature is only for groups',
    private: 'This feature is only for private chats',
    wait: 'In process... ',    
    error: 'Error!',
}

global.thumb = fs.readFileSync('./modsMedia/thumb.jpg')

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update'${__filename}'`))
    delete require.cache[file]
    require(file)
})
