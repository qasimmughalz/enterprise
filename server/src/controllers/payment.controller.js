const stripe = require("stripe")(process.env.STRIPE_KEY);
const Users = require("../models/user");

const checkout = (email,domain,feature) => {
  console.log("Feature ", feature)

  Users.findOne({ Email: email }, async (err, user) => {
    if (err) {
      console.log("Error finding user" );
    } else if (!user) {
      console.log("User not found" );
    }
    const subscriptions = await stripe.subscriptions.list(
      {
        customer: user.userStripeId,
        status: "all",
        limit: 1,
        expand: ["data.default_payment_method"],
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );
    let result = user?.Sites?.find((site) => site.domainName == domain);
    if(typeof(result) !== 'undefined'){
      let index = result?.Feature?.indexOf(feature)
      result.stripeSubscriptionId[index] = subscriptions.data[0].id; // Storing Subscription ID with specific domain
      result.isActive[index] = true;
      await user
        .save()
        .then(() => {
          console.log("User Subscribed Successfully")
        })
        .catch((err) => {
          console.log(err)
        });
    }
    else {
      console.log("Requested feature not found")
    }
  });
};

exports.plans = async (req, res) => {
 // Return available plans
  const plans = await stripe.prices.list({
      apiKey: process.env.STRIPE_KEY
  });
    let response = plans.data.map(plan => {return({id: plan.id, name: plan.nickname, price: plan.unit_amount/100, interval: plan.recurring.interval})})
  return res.json(response)

  // Send List of subscriptions
  // const subscriptions = await stripe.subscriptions.list(
  //   {
  //     customer: "cus_LnP1yXAA5XZ1wQ", // user.userStripeId,
  //     status: "all",
  //     limit: 1,
  //     expand: ["data.default_payment_method"],
  //   },
  //   {
  //     apiKey: process.env.STRIPE_SECRET_KEY,
  //   }
  // );
  // res.json(subscriptions);

  // Delete specific subscription
  // stripe.subscriptions.del('sub_49ty4767H20z6a');
};

exports.createSession = async (req, res) => {
  try {
    const {email, priceId, domainName, feature} = req.body
    const user = await Users.findOne({ Email: email });
  //  console.log("User ", user);
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: "http://plugin-app.herokuapp.com/success",
        cancel_url: "http://plugin-app.herokuapp.com/failure",
        customer: user.userStripeId,
        metadata: {
          domainName: domainName,
          feature: feature,
        },
      },
      {
        apiKey: process.env.STRIPE_SECRET_KEY,
      }
    );

    res.status(200).json(session.url);
  } catch (e) {
    res.status(400).json(e);
  }
};

exports.webhookCheckout = async (request, response, next) => {
  console.log("webhook is called");
  const signature = request.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      signature,
      "whsec_cb7Ntssrr5wfE5DJUdOjjHSCCGlgx4ab"
    );
  } catch (err) {
    return response.status(400).send(`Webhook error: ${err.message}`);
  }
  console.log("event.type ", event.type);
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const DomainName = session.metadata.domainName;
      const feature = session.metadata.feature;
      const Email = session.customer_details.email;
      console.log("Session Completed")
      await checkout(Email,DomainName,feature);

      break;

    // case "payment_intent.succeeded":
    //   const paymentIntent = event.data.object;
    //   const price = paymentIntent.amount_received;
    //   const userId = paymentIntent["customer"];
    //   console.log("Succeeded ",paymentIntent)

    //   if (userId) {
    //     const customer = await stripe.customers.retrieve(userId);
    //     //  createCustomerPlain(customer, price, true);
    //   } else {
    //     console.log("no customer found");
    //   }

    //   break;

    case "invoice.payment_succeeded":
      const successPaymentIntent = event.data.object;
      const successSubID = successPaymentIntent.subscription;
      const successCustID = successPaymentIntent.customer
      await updateSuccessSub(successCustID,successSubID)
      break;

    case "invoice.payment_failed":
      const paymentIntent = event.data.object;
      const subscriptionID = paymentIntent.subscription;
      const customerID = paymentIntent.customer
      console.log("Failure Sub ID ",subscriptionID," Cust ID ",customerID)
      if (customerID) {
        await updateSub(customerID,subscriptionID,false);
      } else {
        console.log("no customer found");
      }
      break;

    // case "payment_intent.payment_failed":
    //   const paymentIntent2 = event.data.object;
    //   const message = paymentIntent2.last_payment_error && paymentIntent2.last_payment_error.message;
    //   console.log('Failed:', paymentIntent2.id, message);
    //   break;

    case "customer.subscription.deleted":
      const subIntent = event.data.object;
      const subID = subIntent.id;
      const custID = subIntent.customer;
      console.log("Delete Sub ID ",subID," Cust ID ",custID)
      if (custID) {
        await updateSub(custID,subID,true);
      } else {
        console.log("no customer found");
      }

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
};

const updateSub = (custID,subID,isDelete) =>{
  Users.findOne({ userStripeId: custID }, async (err, user) => {
    if (err) {
      console.log("Error finding user" );
    } else if (!user) {
      console.log("User not found" );
    }
    //let subscription = user?.Sites?.find((site) => site.stripeSubscriptionId === subID);
    let subscription = user?.Sites?.find((site) => site.stripeSubscriptionId.find((s) => s === subID) );

    if(typeof(subscription) !== 'undefined'){    
      let index = subscription.stripeSubscriptionId.indexOf(subID)
      subscription.isActive[index] = false;
      if(isDelete)
      {
        subscription.stripeSubscriptionId[index] = '';
      }
      await user.save().then(() => console.log("Subscription updated"))
    }
    else {
        console.log("Subscription not found")
    }
})
}

const updateSuccessSub = (custID,subID) =>{
  Users.findOne({ userStripeId: custID }, async (err, user) => {
    if (err) {
      console.log("Error finding user" );
    } else if (!user) {
      console.log("User not found" );
    }
    //let subscription = user.Sites.find((site) => site.stripeSubscriptionId === subID);
    let subscription = user?.Sites?.find((site) => site.stripeSubscriptionId.find((s) => s === subID) );

    if(typeof(subscription) !== 'undefined'){
      let index = subscription.stripeSubscriptionId.indexOf(subID)
      if(!subscription.isActive[index])
      {
        subscription.isActive[index] = true;
        await user.save().then(() => console.log("Subscription updated"))
      }
      else{
        console.log("Subscription already active. No updation required")
      }
    }
    else {
        console.log("Subscription not found")
    }
})
}

//getting session details agains the webhook id

// exports.createSessionWithTrial = async(req,res) => {
  //     try {
  //         const user = await Users.findOne({Email: req.body.email})
  //         console.log("User ", user);
  //         const session = await stripe.subscriptions.create({
  //             items : [
  //                 {
  //                     price: req.body.priceId,
  //                     quantity: 1,
  //                 }
  //             ],
  //             customer: user.userStripeId,
  //             trial_period_days: 7,
  //         },
  //         {
  //              apiKey: process.env.STRIPE_SECRET_KEY,
  //         })
  //         const subscriptions = await stripe.subscriptions.list(
  //             {
  //               customer: user.userStripeId,
  //               status: "all",
  //               expand: ["data.default_payment_method"],
  //             },
  //             {
  //               apiKey: process.env.STRIPE_SECRET_KEY,
  //             }
  //         );
  //           let ids = subscriptions.data.map(d => d.id)
  //           let url = session.url
  //           console.log(session)
  //           res.send({ids,url})
  //        // res.status(200).json(session.url)
  //     }
  //    catch(e){
  //     res.status(400).json(e)
  //    }
  // }