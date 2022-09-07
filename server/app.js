const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./src/db/connection");
const app = express();
const bodyParser = require("body-parser");
const path = require('path')
const port = process.env.PORT || 5000;

// Add headers
// app.use(function (req, res, next) {

//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );

//   // // Website you wish to allow to connect
//   // res.setHeader('Access-Control-Allow-Origin', '*');

//   // // Request methods you wish to allow
//   // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // // Request headers you wish to allow
//   // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//   // // Set to true if you need the website to include cookies in the requests sent
//   // // to the API (e.g. in case you use sessions)
//   // res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });



app.use(cors({
  origin:'*', 
  // methods: "GET,POST,PUT,DELETE",
  // credentials:true,
  // optionSuccessStatus:200
}));

app.use(express.json())
app.use(express.static(path.join(__dirname , 'public')))

app.use(bodyParser.json({
  limit: '5mb',
  // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
  verify: function(req,res,buf) {
      var url = req.originalUrl;
      if (url.startsWith('/webhook')) {
          req.rawBody = buf.toString()
      }
  }}));


//app.options('*', cors())

// app.options('*', cors({
//   origin: '*', 
//   methods: 'GET,POST,PUT,DELETE',
//   optionsSuccessStatus: 200
// }));

const routes = require("./src/routes/routes");
const { webhookCheckout } = require("./src/controllers/payment.controller");

app.post(
  "/webhook",
 // bodyParser.raw({ type: "application/json" }),
  webhookCheckout
);
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next(); // Do nothing with the body because I need it in a raw state.
  } else {
    express.json()(req, res, next);  // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
  }
});
//app.use(express.json());
app.use("/api", routes);


// app.use("/", (req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.send("Server Running");
// });

app.use("/success", (req, res) => {
  res.send("Success");
});

app.use("/failure", (req, res) => {
  res.send("failure");
});

app.get('/*', (req, res)=>{
  console.log(path.join(__dirname , 'public', 'index.html'))
  res.sendFile(path.join(__dirname , 'public', 'index.html'))
})

// app.all("*", (req, res, next) => {
//   next(new appError(`can not find ${req.originalUrl} on this server!`, 404));
// });


app.listen(port, () => {
  console.log(`App is listening on PORT ${port}`);
});
