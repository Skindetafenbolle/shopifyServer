const express = require('express');
const bodyParser = require('body-parser');
const {sendPromo} = require('./sendPromoToMail')
const { promoGenerate } = require('./promoGenerator')


const app = express();
const cors = require('cors')
const port = process.env.PORT || 3000;



app.use(bodyParser.json());
app.use(cors({
    origin: 'https://test-shop-with-checkout-ext.myshopify.com',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

app.get('/', (req, res) => {
    res.status(200).send('Main page')
})

app.post('/webhooks/create-promo-code', async (req, res) => {
    const data = req.body
    const { userEmail } = req.body;

    if (data.eventType === 'custom_button_click_promoGenerate') {
        console.log('Click: ', data);
        await sendPromo(userEmail) // Передаем параметр res
        res.status(200).json({ message: 'Success' });
    } else {
        console.log('Unknown event type:', data.eventType);
        res.status(400).json({ error: 'Bad Request' });
    }
});
  


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
