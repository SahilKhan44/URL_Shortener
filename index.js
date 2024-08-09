const express = require("express");
const urlRoute = require("./routes/url");
const {connectToMongoDB} = require("./connect")
const URL = require('./models/url');

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url")
.then(() => console.log('mongob connected'));

app.use(express.json());

app.use("/url",urlRoute);

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    
    try {
        const entry = await URL.findOneAndUpdate(
            { shortId },
            { $push: { visitHistory: { timestamp: Date.now() } } },
            { new: true } // This option returns the updated document
        );

        if (!entry) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error('Error fetching or updating the URL entry:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT,() => {
    console.log(`server started at ${PORT}`);
    
})