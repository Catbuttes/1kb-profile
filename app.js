const express = require('express')
const mustache = require('mustache')
require('rss-parser')
const fs = require('fs')
const Parser = require('rss-parser')
const app = express()
const port = 5000

const template = fs.readFileSync('template.mustache')
const index = fs.readFileSync('index.html')

app.get('/', async (req, res) => {
    try {
        console.log("%s %s %s %s", new Date(Date.now()).toISOString(), req.ip, req.hostname, req.url)

        res.type('html')
        res.removeHeader('Date');
        res.removeHeader('Etag');
        res.removeHeader('Keep-Alive');
        res.removeHeader('X-Powered-By');
        res.set("Connection", "close");
        res.end(index)
    } catch (error) {
        res.type('html')
        res.removeHeader('Date');
        res.removeHeader('Etag');
        res.removeHeader('Keep-Alive');
        res.removeHeader('X-Powered-By');
        res.set("Connection", "close");
        res.end("Oops. Something went wrong. Are you sure you provided a user on a calckey server?")

        console.error(error)
    }
})



app.get('/:user', async (req, res) => {
    try {
        console.log("%s %s %s %s", new Date(Date.now()).toISOString(), req.ip, req.hostname, req.url)
        const parser = new Parser({
            customFields: {
                item: [['content:encoded', "encoded"], 'subtitle'],
            }
        });

        let fulleUser = req.params.user;
        //Make sure the username is in the format we expect
        if (!fulleUser.startsWith("@"))
        {
            fulleUser = "@"+fulleUser
        }

        const splitUser = fulleUser.split("@")
        const url = "https://" + splitUser[2] + "/@" + splitUser[1] + ".rss"

        const rssData = await parser.parseURL(url)

        const desc = rssData.description
        const splitDesc = desc.split(" ")
        const pubDate = new Date(rssData.items[0].pubDate)
        let content = rssData.items[0].encoded

        const remainingBudget = 1024
            - 125 //Headers approx
            - 465 //Template
            - (req.params.user.length * 3)  //username
            - splitDesc[0].length   //Notes
            - splitDesc[2].length   //Following
            - splitDesc[4].length   //Followers
            - pubDate.toDateString().length //Latest Post date

        if (content.length > remainingBudget) {
            content = content.substring(0, remainingBudget - 3) + "..."
        }

        const data = {
            user: req.params.user,
            notes: splitDesc[0],
            following: splitDesc[2],
            followers: splitDesc[4],
            datestamp: pubDate.toDateString(),
            content: content
        }

        res.type('html')
        res.removeHeader('Date');
        res.removeHeader('Etag');
        res.removeHeader('Keep-Alive');
        res.removeHeader('X-Powered-By');
        res.set("Connection", "close");
        res.end(mustache.render(template.toString(), data))
    } catch (error) {
        res.type('html')
        res.removeHeader('Date');
        res.removeHeader('Etag');
        res.removeHeader('Keep-Alive');
        res.removeHeader('X-Powered-By');
        res.set("Connection", "close");
        res.end("Oops. Something went wrong. Are you sure you provided a user on a calckey server?")

        console.error(error)
    }
})

app.get('/:user/f', async (req, res) => {
    try {
        console.log("%s %s %s %s", new Date(Date.now()).toISOString(), req.ip, req.hostname, req.url)
        const parser = new Parser();

        let fulleUser = req.params.user;
        //Make sure the username is in the format we expect
        if (!fulleUser.startsWith("@")) {
            fulleUser = "@" + fulleUser
        }

        const splitUser = fulleUser.split("@")
        const url = "https://" + splitUser[2] + "/@" + splitUser[1] + ".rss"

        const rssData = await parser.parseURL(url)

        res.redirect(rssData.items[0].link)
    } catch (error) {
        res.type('html')
        res.removeHeader('Date');
        res.removeHeader('Etag');
        res.removeHeader('Keep-Alive');
        res.removeHeader('X-Powered-By');
        res.set("Connection", "close");
        res.end("Oops. Something went wrong...")
    }

})

app.get('/:user/p', async (req, res) => {
    try {
        console.log("%s %s %s %s", new Date(Date.now()).toISOString(), req.ip, req.hostname, req.url)
        const parser = new Parser();

        let fulleUser = req.params.user;
        //Make sure the username is in the format we expect
        if (!fulleUser.startsWith("@")) {
            fulleUser = "@" + fulleUser
        }

        const splitUser = fulleUser.split("@")
        const url = "https://" + splitUser[2] + "/@" + splitUser[1]

        res.redirect(url)
    } catch (error) {
        res.type('html')
        res.removeHeader('Date');
        res.removeHeader('Etag');
        res.removeHeader('Keep-Alive');
        res.removeHeader('X-Powered-By');
        res.set("Connection", "close");
        res.end("Oops. Something went wrong...")
    }

})

app.enable("trust proxy", ['loopback', 'linklocal', 'uniquelocal'])

app.listen(port, () => {
    console.log(`1kb app listening on port ${port}`)
})