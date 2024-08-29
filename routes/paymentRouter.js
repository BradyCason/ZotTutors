const { Router } = require("express");

const paymentRouter = Router();
const paymentController = require("../controllers/paymentController")

paymentRouter.post("/create-checkout-session", paymentController.createCheckoutSession)
paymentRouter.get("/cancel", paymentController.cancel);
paymentRouter.get("/success", paymentController.success)

module.exports = paymentRouter;