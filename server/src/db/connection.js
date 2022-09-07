const mongoose = require("mongoose");


mongoose
  .connect('mongodb://dbadmin-user:mrfA8EXFEv54zoojeIG%23L%25*m3m@212.199.114.149:28701/?authMechanism=DEFAULT&authSource=sitedb1', {})
  .then(() => {
    console.log("Database Connected.");
  })
  .catch((err) => {
    console.log("Error connecting to Database.", err);
  });
