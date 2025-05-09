const express = require("express")
const puppeteer = require("puppeteer")

const app = express()
const PORT = process.env.PORT || 3000

app.get("/fetch-content", async (req, res) => {
    const { url, id } = req.query

    if (!url || !id) {
        return res.status(400).send("URL and ID are required")
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            executablePath: puppeteer.executablePath()
        })

        const page = await browser.newPage()
        await page.goto(url, { waitUntil: "networkidle2" })

        const content = await page.evaluate((id) => {
            const element = document.getElementById(id)
            return element ? element.innerHTML : null
        }, id)

        await browser.close()

        if (content) {
            res.send(content)
        } else {
            res.status(404).send(`ID ${id} not found`)
        }
    } catch (error) {
        console.error("Error fetching content:", error.message)
        res.status(500).send("Error fetching content")
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
