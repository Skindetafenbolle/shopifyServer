require('dotenv').config();
const { promoGenerate } = require('./promoGenerator')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.USER_PASS,
    }
})

const mailOptions = {
    from: process.env.USER_MAIL,
    to: ' ',
    subject: 'Mail with promo',
    text: ' ',
};

const sendPromo = async (recipientEmail) => {
    try {
        // Вызываем promoGenerate изнутри sendPromo
        const promoResult = await promoGenerate();

        if (promoResult.success) {
            const promoCode = promoResult.codeDiscount.codes.nodes[0].code;
            const titlePromo = promoResult.codeDiscount.title;
            const percentage = promoResult.codeDiscount.customerGets.value.percentage * 100
            mailOptions.to = recipientEmail; // Устанавливаем адрес получателя
            mailOptions.text = `Promo Code: ${promoCode}`;
            mailOptions.subject = `${titlePromo}, скидка размером - ${percentage}%`;
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending promo code via email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        } else {
            console.error('Error generating promo code:', promoResult.error);
        }
    } catch (error) {
        console.error('Error in sendPromo:', error);
    }
};

module.exports = {
    sendPromo: sendPromo
};