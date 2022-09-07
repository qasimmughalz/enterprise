const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: "Name is required",
    minlength: [3, "Name must be atleast 3 character long"],
  },
  Email: {
    type: String,
    required: "Email is required",
    unique: true,
  },
  PhoneNo: {
    type: Number,
    required: true,
  },
  Password: {
    type: String,
    required: "Password is required",
    minlength: [8, "Password must be atleast 8 character long"],
    required: true,
  },
  // saltSecret: {
  //     type: String,
  // },
  isVerified: {
    type: Boolean,
    default: false,
  },

  userStripeId: { type: String },

  Sites: [
    {
      domainName: { type: String },
      Language: { type: String },
      Platform: { type: String },
      Script: { type: [String] },
      stripeSubscriptionId: { type: [String] },
      isActive: { type: [Boolean], default: false,},
      Feature :{
        type: [String],
        enum: [process.env.FEATURE_PLUGIN_ANALYTICS_COMBO],
      }
    },
  ],
  companyDetails: {
    companyName: { type: String },
    PhoneNo: { type: Number },
    Address: { type: String },
    Country: { type: String },
    State: { type: String },
    Website: { type: String },
    invoiceEmail: { type: String },
  },
  // Users: [
  //   {
  //     Name: { type: String },
  //     Email: { type: String },
  //     MobileNo: { type: Number },
  //     WhatsAppNo: { type: Number },
  //   },
  // ]
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next();
  // bcrypt.genSalt(10, async (err, salt) => {
  this.Password = await bcrypt.hash(this.Password, 10);
  next(); /*, (err, hash) => {
          //  console.log("In pre function ",this.Password);
            this.Password = hash;
           // this.saltSecret = salt;
            
        });*/
  //  });
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

userSchema.methods.generateJwt = function () {
  return jwt.sign(
    { id: this._id, Name: this.Name, Email: this.Email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};
module.exports = mongoose.model("Users", userSchema);
