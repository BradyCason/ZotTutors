const db = require("../db/queries");
const stripe = require('stripe')(env(STRIPE_KEY));

async function createCheckoutSession(req, res) {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Tutor Membership',
                    },
                    unit_amount: 500,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/payment/cancel`,
            client_reference_id: req.body.userId
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).send("Failed to create checkout session");
    }
}

function cancel(req, res) {
    res.redirect("/profile/tutor-sign-up")
}

async function success(req, res) {
    // Retrieve session ID from the query parameters
    const sessionId = req.query.session_id;

    if (!sessionId) {
        return res.status(400).send('No session ID provided');
    }

    try {
        // Retrieve the session details from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Update the user in your database
        await db.makeTutor(req.user.id);

        // Render the success page
        res.render("success", { 
            user: req.user
         });
    } catch (error) {
        console.error("Error handling success:", error);
        res.status(500).send("Failed to process success");
    }
}

module.exports = {
    createCheckoutSession,
    cancel,
    success
}