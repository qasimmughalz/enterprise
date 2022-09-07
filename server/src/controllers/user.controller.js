const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const Users = require("../models/user");
const UserVerfication = require("../models/otpVerificationSchema");
const PasswordResetScehma = require("../models/passwordResetSchema");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.signup = async (req, res) => {
    const { name, email, password, phoneNo } = req.body
    try{
       // Check if email already exist
        await Users.findOne({ Email: email }).exec((err, user)=>{
            if(user) {
                return res.status(200).json({ 
                    error: "This email is already in use."
              });
            }
            // Creating new user
            let newuser = new Users({
                Name: name,
                Email: email,
                Password: password,
                isVerified: false,
                PhoneNo: phoneNo,
            })
            // Saving new user
            newuser.save((err,data)=>{
                // Signup with verfication email
                if(err){
                    console.log(err)
                    return res.status(400).json({error: "Error saving new user"});
                }
                else if(data){
                    // Sending Verfication Email
                    sendVerficationEmail(data,res)
                }
                // Simple Signup
                // if(err){
                //     return res.status(400).json({error: "Error saving new user"})
                // }
                // res.status(200).json({
                //     message: "Successfully Signup"
                // })
            })
        });
   } catch(err){
       return res.status(400).send(err);
   }
}

sendEmail = async ({email, subject, body}) => {
    return new Promise((resolve,reject)=>{
        try {
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
              //  port: 587,
              //  secure: false, // true for 465, false for other ports
                // requireTLS: true,
                // tls : {
                //     rejectUnauthorized: false,
                // },
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASSWORD
                }
            });
            let mailOptions = {
                from: '"Plugin"<plugin.gmail.com>', // sender address
                to: email, // list of receivers
                subject: subject, // Subject line
                html: body,
            };
           
            transporter.sendMail(mailOptions, function(error, info){
               if (error) {
                    console.log("Error: " + error );
                    resolve(false); 
               } 
              else {
                  console.log('Email sent: ' + info.response);
                  resolve(true);
               }
              });
        } catch (error) {
            console.log(error, " email not sent");
            resolve(false);
        }
       
    })  
    // try {
    //     // Create Mail Transport
    //     let transporter = nodemailer.createTransport({
    //         host: "smtp.gmail.com",
    //         port: 587,
    //         secure: false, // true for 465, false for other ports
    //         // requireTLS: true,
    //         // tls : {
    //         //     rejectUnauthorized: false,
    //         // },
    //         auth: {
    //           user: process.env.EMAIL,
    //           pass: process.env.PASSWORD
    //         }
    //     });

    //     let mailOptions = {
    //         from: '"Plugin"<plugin.gmail.com>', // sender address
    //         to: email, // list of receivers
    //         subject: subject, // Subject line
    //         html: body,
    //     };

    //     return transporter.sendMail(mailOptions);

    //   //  console.log("email sent sucessfully");
    // } catch (error) {
    //     console.log(error, "email not sent");
    // }
};

const sendVerficationEmail = async ({_id, Email, Name},res) => {
    try {    
        if(!Name) { Name = "User"}    
        // Create OTP
        const otp = `${Math.floor(1000 + Math.random() * 9000 )}`;

        let mailOptions = {
            email: Email, // list of receivers
            subject: "Confirmation Email", // Subject line
            body: `<h1>Hi ${Name}</h1><br>
            <p>Thanks for registration</p> <br>
            <p>Please Enter this <b>${otp}</b> to verify your account</p>
            <p> This OTP will expire in 30 minutes </p>`
        }; 

        // OTP Encryption
        const encryptedOTP = await bcrypt.hash(otp,10);
        console.log("OTP Generated", encryptedOTP)

        // Creating new object for OTP Verification
        const userOTPVerification = await new UserVerfication({
            userId: _id,
            otp: encryptedOTP ,
            createdAt: Date.now(),
            expireAt: Date.now() + 1800000,
        })
        // Saving OTP Verification object in db
        await userOTPVerification.save();

        // Sending Email
        const success = await sendEmail(mailOptions)
        
        if(success)
        {
            // Sending Response
            res.status(201).json({ 
                status: "Verfication Pending",
                message: "Verfication email sent",
                data: {
                    userId: _id,
                    email: Email,
                }
            });
        } else {
            Users.deleteOne({Email});
            UserVerfication.deleteMany({userId: _id})
            res.status(400).json({
                error: "Error sending email",
            });
        }
        
    } catch(e) {
        console.log(e)
        res.status(400).json({ 
            status: "Failed",
            error: "Error in verifing user"
        });
    }
}

exports.verifyOTP = async (req, res) => {
    try {
        let { userId, otp } = req.body;
        if(!userId || !otp) {
            res.status(400).json({
                error : "User or OTP Details not found"
            })
        }
        else {
            UserVerfication.find({userId}, async(err,user)=>{
                if(user?.length <= 0){
                    // no user found
                    res.status(400).json({
                        error : "User doesnot exist or verified already"
                    })
                } else {
                    // user otp exists
                    const { expireAt } = user[0];
                    const hashedOTP = user[0].otp;
                    if(expireAt < Date.now()) {
                        // OTP Expired
                        await UserVerfication.deleteMany({userId})
                        res.status(400).json({
                            error : "OTP Expired, Please Resend it"
                        })
                    } else {
                        const isCorrectOTP = await bcrypt.compare(otp, hashedOTP)
                        if(isCorrectOTP) {
                            // OTP Matches
                            const email = await Users.findOne({_id: userId}).select('Email')
                            const customer = await stripe.customers.create({
                                email: email.Email,
                            },{
                                apiKey: process.env.STRIPE_SECRET_KEY,
                            })
                            console.log(customer)
                           await Users.updateOne({_id: userId},{ isVerified: true, userStripeId: customer.id, companyDetails: {
                                companyName: '',
                                PhoneNo: 0,
                                Address: '',
                                Country: '',
                                State: '',
                                Website: '',
                                invoiceEmail: '',
                            } })
                           // await Users.updateOne({_id: userId},{ isVerified: true})
                            await UserVerfication.deleteMany({userId})
                            res.status(200).json({
                                message: "User Verified Successfully"
                            });
                        } else {
                            // Invalid OTP
                            res.status(400).json({
                                error : "Invalid OTP, Please again check your inbox"
                            })
                        }
                    }
                }
            })
        }
   } catch(err){
       return res.status(400).send(err);
   }
}

// Resend Verification Code
exports.resendOTP = async (req, res) => {
    try {
        let { userId, email } = req.body;
        if(!userId || !email) {
            res.status(400).json({
                error : "UserID or Email Details not found"
            })
        }
        else {
            // Delete Existing records for this user
            await UserVerfication.deleteMany({userId});
            sendVerficationEmail({_id: userId, Email: email},res);
        }

    } catch(e) {
        return res.status(400).json({
            error: "Error in resending otp"
        });
    }
}

exports.authenticate = (req,res) => {
    const { email, password} = req.body;
    try {
        Users.findOne({ Email: email }, async (err,user)=>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            else if(!user) {
                res.status(400).json({
                    error: "Email not Registered. Please Sign Up!"
                })
            }
            else {
                if(user.comparePassword(password) && user.isVerified) {
                    res.status(200).json({
                        message: "Token Created",
                        token: user.generateJwt()
                    });
                } else if(user.comparePassword(password) && !user.isVerified) {
                    // sent OTP to verify
                    await UserVerfication.deleteMany({userId: user._id});
                    sendVerficationEmail({_id: user._id, Email: email, Name: user.Name},res);
                }
                else {
                    res.status(400).json({
                        error: "Incorrect Password"
                    })
                }
            }
        })
    } catch(e) {
        res.status(400).json(e)
    }
}

exports.login = (req,res) =>{
    try {
        Users.findOne({ _id: req._id }, (err, user) => {
            if(err){
                return res.status(404).json({ error: 'Error finding user.' });
            }
            else if (!user)
              return res.status(404).json({ error: 'User record not found.' });
            else
              return res.status(200).json({ message: 'User found.' });
            //  user : _.pick(user,['fullName','email'])
        });
    } catch(e) {
        res.status(400).send(e)
    }
}

exports.changePassword = async(req,res) => {
    try {
        Users.findOne({Email: req.body.email},(err,user)=>{
            if (err) { 
                res.status(400).json({ error: "User doesnot exist"});
            }
            else{
                user.Password = req.body.password
                user.save().then(data => {
                    res.status(200).json({message: "Password changed successfully"})
                    }).catch(err => {
                      res.status(404).send(err)
                });
            }
        })
    } catch(e) {
        res.status(400).send(e)
    }
}

exports.ForgotPassword = async(req,res) =>{
    try {
        if (!req.body.email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await Users.findOne({Email:req.body.email});
        //console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'Email does not exist' });
        }
        if(user.isVerified) {
            var resettoken = new PasswordResetScehma({ _userId: user._id, resetToken: crypto.randomBytes(16).toString('hex') });
            resettoken.save( async(err,data) => {
                if (err) { 
                    return res.status(500).send({ message: err }); 
                }
                PasswordResetScehma.find({ _userId: user._id, resetToken: { $ne: data.resetToken } }).deleteOne().exec();
               // res.status(200).json({ message: 'Reset link sent to your email successfully.' });
                let mailOptions = {
                    email: user.Email, // list of receivers
                    subject: "Password Reset", // Subject line
                    body: 'You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://localhost:3000/resetPassword/' + data.resetToken + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };

                await sendEmail(mailOptions);
                // Sending Response
                res.status(200).json({
                    message: "Reset link sent to your email successfully.",
                });
            })
        } else {
            return res.status(400).send({ message: "User is not modified" }); 
        }
    } catch(e) {
        res.status(400).send(e)
    }
}

exports.NewPassword = async(req,res) =>{
    try {
        if (!req.body.resettoken) {
            return res.status(404).json({ message: 'Token not found' });
        }
        PasswordResetScehma.findOne({ resetToken: req.body.resettoken }, function (err, userToken, next) {
            if (!userToken) {
                return res.status(400).json({ message: 'Token has expired' });
            }
            Users.findOne({_id: userToken._userId}, function (err, user) {
                if (err || !user) {
                    return res.status(404).json({ message: 'User does not exist' });
                }
                user.Password = req.body.newPassword
                user.save().then(data => {
                    userToken.deleteOne()
                    res.status(200).json({ message: 'Password reset successfully' })
                }).catch(err => {
                    res.status(400).json({ message: 'Password can not reset.' });
                });
            })
        })
    } catch(e) {
        res.status(400).send(e)
    }
}

exports.getUser = (req,res) => {
    try {
        const email = req.params.email
        console.log(email)
        Users.findOne({ Email: email }, async (err,user) =>{
            if(err){
                return res.status(404).json({ error: 'Error finding user.' });
            }
            else if (!user)
              return res.status(404).json({ error: 'User record not found with provided email.' });
            else
              return res.status(200).json({ message: 'User found.', id: user._id, Name: user.Name, Email: user.Email, PhoneNo: user.PhoneNo });
        });
    } catch (e) {
        res.status(400).send(e)
    }
}

exports.getSites =  async(req, res) => {
    try {
        const email = req.params.email
        console.log(email)
        if(email){
            const result = await sendSiteStatus(email)
            console.log("Get Sites email: ",Array.prototype.concat(...result))
            res.status(200).send(Array.prototype.concat(...result))  
        } else {
            res.status(400).send({error: "Email not found in parameters"})
        }          
    } catch(e){
        res.status(400).send(e)
    }
}

const sendSiteStatus = async (email) => {
    return new Promise((resolve,reject)=>{
        try {
            Users.findOne({ Email: email }, async (err,user) =>{
                if(err){
                    return res.status(400).json({error: "Error finding user"});
                }
                else if(!user){
                    return res.status(400).json({error: "User not found"});
                }
                else {
                    let m = await user?.Sites?.map(async(site) => {
                        let inner = await site.stripeSubscriptionId.map(async(subscriptionId,i)=> {
                            if(subscriptionId !== '' && site.isActive[i]) {
                                let subscriptions = await stripe.subscriptions.list(
                                    {
                                      customer: user.userStripeId,
                                      status: "all",
                                      expand: ["data.default_payment_method"],
                                    },
                                    {
                                      apiKey: process.env.STRIPE_SECRET_KEY,
                                    }
                                )
                                let sub = subscriptions.data.filter((d) => d.id === subscriptionId)
                                let endSubs = new Date(sub[0]?.current_period_end * 1000);
                                        endSubs =
                                        endSubs.getDate() +
                                        "/" +
                                        (endSubs.getMonth() + 1) +
                                        "/" +
                                        endSubs.getFullYear();
                                return ({message: "User have subscribed to a plan", domain: site.domainName, subscriptionEndDate: endSubs, language: site.Language, platform: site.Platform, feature: site.Feature[i] })
                                
                            } else if (!site.isActive[i] && subscriptionId !== ''){
                                return ({message: "Your subscription has been paused", domain: site.domainName, language: site.Language, platform: site.Platform, feature: site.Feature[i] })
                            } 
                            else {
                                site.isActive[i] ? site.isActive[i] = false : site.isActive[i]
                                return ({message: "No subscription activated", domain: site.domainName, language: site.Language, platform: site.Platform, feature: site.Feature[i]})
                            }
                        })
                        return Promise.all(inner)   
                    })
                    const result = await Promise.all(m)
                    user.save().then(()=>{
                        resolve(result)
                    })
                }
            })
        } catch (error) {
            resolve(false);
        }
       
    })  
}

exports.updateCompanyDetails = async(req,res) => {
    const {userId,companyName,PhoneNo, address, country, state, website, invoiceEmail} = req.body;
    const user= await Users.updateOne({_id: userId},{ companyDetails: {
        companyName: companyName,
        PhoneNo: PhoneNo,
        Address: address,
        Country: country,
        State: state,
        Website: website,
        invoiceEmail: invoiceEmail,
    } })
    user.acknowledged ?
    res.status(200).json({message:"Details modified successfully"}) :
    res.status(400).json({message:"Error Modifiying Details"})
}

exports.getAllUsers = (req,res) =>{
    console.log("req._id ",req._id);
    try {
        Users.find({}, (err, user) => {
            if(err){
                return res.status(404).json({ error: 'Error finding users.' });
            }
            else if (!user)
              return res.status(404).json({ error: 'User records not found.' });
            else
              return res.status(200).json({ message: 'User found.', user});
            //  user : _.pick(user,['fullName','email'])
        });
    } catch(e) {
        res.status(400).send(e)
    }
}

exports.contactUs = async (req,res) => {
    const {email,message} = req.body;
    try {
        let mailOptions = {
            email: process.env.CONTACT_US_EMAIL, // list of receivers
            subject: "Contact Us Form Submission", // Subject line
            body: `<h1>Contact Form</h1><br>
            <table>
                <tr>
                    <td><strong>Email: </strong></td>
                </tr>
                <tr>
                    <td width="20">&nbsp;</td>
                    <td>${email}</td>
                </tr>
                <tr>
                    <td><strong>Message: </strong></td>
                </tr>
                <tr>
                    <td width="20">&nbsp;</td>
                    <td>${message}</td>
                </tr>
            </table>`
        };
        const success = await sendEmail(mailOptions)
        if(success)
        {
            res.status(201).json({
                message: "Contact Form Submitted Successfully",
            });
        } else {
            res.status(400).json({
                error: "Error sending email",
            });
        } 
    } catch (e) {
        res.status(400).send(e)
    }
}

exports.addNewUser = (req,res) => {
    const {accountEmail, userName, userEmail, userMobileNo, userWhatsAppNo} = req.body;
    try {
        Users.findOne({ Email: accountEmail },{ Password: 0 },async(err,user)=>{
            if(err || !user){
                return res.status(400).json({error: "Error finding user"});
            }
            let isEmailExist = await user?.Users?.find((u) => u.Email === userEmail);
            if(typeof(isEmailExist) !== 'undefined'){         
                res.status(400).send({error: "This email is already in use! Try using another"})
            } else {
                newUser = {
                    Name: userName,
                    Email: userEmail,
                    MobileNo: userMobileNo,
                    WhatsAppNo: userWhatsAppNo,
                }
                user.Users.push(newUser)
                user.save().then(data => {
                    res.status(200).send({message: 'New User added successfully!'})
                    }).catch(err => {
                        console.log("Error saving new user: ",err)
                        res.status(404).send(err)
                });
            }
        })
    } catch(e){
        console.log(e)
        res.status(400).send(e)
    }
}

//--------------------------- ADMIN APIS --------------------------------

exports.getAllUnpaidScripts = (req,res) =>{
    try {
        Users.find({}, async(err, user) => {
            if(err){
                return res.status(404).json({ error: 'Error finding users.' });
            }
            else if (!user){
                return res.status(404).json({ error: 'User records not found.' });
            }
            else{
                let m = await user.map(async (u) => {
                    let result = await sendSiteStatus(u.Email)            
                    result = Array.prototype.concat(...result)
                    if(result.length != 0) {
                        let userResult = await result.filter(site => site.message === 'No subscription activated').map(s => {
                            s.Email = u.Email
                            s.Name = u.Name
                            s.PhoneNo = u.PhoneNo
                            delete s.message
                            delete s.language
                            delete s.platform
                            s.isActive = false
                            return s
                        })
                        return(userResult)
                    }
                    else {
                        return null
                    }
                })
                let sending = await Promise.all(m)
                res.send(Array.prototype.concat(...sending.filter(e => e != null)))
            }
        });
    } catch(e) {
        res.status(400).send(e)
    }
}

exports.getAllPaidScripts = (req,res) =>{
    try {
        Users.find({}, async(err, user) => {
            if(err){
                return res.status(404).json({ error: 'Error finding users.' });
            }
            else if (!user){
                return res.status(404).json({ error: 'User records not found.' });
            }
            else{
                let m = await user.map(async (u) => {
                    let result = await sendSiteStatus(u.Email)
                    result = Array.prototype.concat(...result)
                    if(result.length != 0) {
                        let userResult = await result.filter(site => site.message === 'User have subscribed to a plan').map(s => {
                            s.Email = u.Email
                            s.Name = u.Name
                            s.PhoneNo = u.PhoneNo
                            delete s.message
                            delete s.language
                            delete s.platform
                            s.isActive = true
                            return s
                        })
                        return(userResult)
                    }
                    else {
                        return null
                    }
                })
                let sending = await Promise.all(m)
                res.send(Array.prototype.concat(...sending.filter(e => e != null)))
            }
        });
    } catch(e) {
        res.status(400).send(e)
    }
}

exports.getAllPausedScripts = (req,res) =>{
    try {
        Users.find({}, async(err, user) => {
            if(err){
                return res.status(404).json({ error: 'Error finding users.' });
            }
            else if (!user){
                return res.status(404).json({ error: 'User records not found.' });
            }
            else{
                let m = await user.map(async (u) => {
                    let result = await sendSiteStatus(u.Email)            
                    result = Array.prototype.concat(...result)
                    if(result.length != 0) {
                        let userResult = await result.filter(site => site.message === 'Your subscription has been paused').map(s => {
                            s.Email = u.Email
                            s.Name = u.Name
                            s.PhoneNo = u.PhoneNo
                            delete s.message
                            delete s.language
                            delete s.platform
                            s.isPaused = true
                            return s
                        })
                        return(userResult)
                    }
                    else {
                        return null
                    }
                })
                let sending = await Promise.all(m)
                res.send(Array.prototype.concat(...sending.filter(e => e != null)))
            }
        });
    } catch(e) {
        res.status(400).send(e)
    }
}

exports.getUsersData = async(req,res) => {
    try {
        response = await getAllUsersData()
        res.status(200).send(Array.prototype.concat(...response.filter(e => e != null)))        
    } catch(e) {
        res.status(400).send(e)
    }
}

exports.getAllData = async(req,res) => {
    try {
        let paid = 0;
        let unpaid = 0;
        let paused= 0;
        let data = await getAllUsersData()
        let extractedData = await Array.prototype.concat(...data.filter(e => e != null))
        extractedData.forEach( d =>  {
                paid += d.PaidWebsites
                unpaid += d.UnpaidWebsites
                paused += d.PausedWebsites
        })
        let response = {
            TotalUsers : extractedData.length,
            TotalWebsites: paid + unpaid + paused,
            ActiveScripts : paid,
            PaidWebsites : paid,
            UnpaidWebsites : unpaid,
            PausedWebsites : paused
        }
        res.status(200).send(response)
    } catch (e) {
        res.status(400).send(e)
    }
}

const getAllUsersData = () => {
    return new Promise((resolve,reject)=>{
        try {
            Users.find({}, async(err, user) => {
                if(err){
                    return res.status(404).json({ error: 'Error finding users.' });
                }
                else if (!user){
                    return res.status(404).json({ error: 'User records not found.' });
                }
                else{
                    let m = await user.map(async (u) => {
                        let result = await sendSiteStatus(u.Email)
                        result = Array.prototype.concat(...result)
                        if(result.length != 0) {
                            let userResult;
                            let userPaidResult = await result.filter(site => site.message === 'User have subscribed to a plan')
                            let userUnpaidResult = await result.filter(site => site.message === 'No subscription activated')
                            let userPausedResult = await result.filter(site => site.message === 'Your subscription has been paused')
                            userResult = {
                                Email : u.Email,
                                Name : u.Name,
                                PhoneNo : u.PhoneNo,
                                NoOfWebsites: userPaidResult.length + userUnpaidResult.length + userPausedResult.length ,
                                PaidWebsites: userPaidResult.length,
                                UnpaidWebsites: userUnpaidResult.length,
                                PausedWebsites: userPausedResult.length,
                            }
                            return(userResult)
                        }
                        else {
                            userResult = {
                                Email : u.Email,
                                Name : u.Name,
                                PhoneNo : u.PhoneNo,
                                NoOfWebsites: 0,
                                PaidWebsites: 0,
                                UnpaidWebsites: 0,
                                PausedWebsites: 0,
                            }
                            return(userResult)
                        }
                    })
                  //  console.log(await Promise.all(m))
                    let sending = await Promise.all(m)
                    resolve(sending)
                }
            });
        } catch (e) {
            res.status(400).send(e)
        }
    })
}

exports.sendReminder = async (req,res) => {
    const {email,domain} = req.body;
    try {
        let mailOptions = {
            email: email, // list of receivers
            subject: "Payment Reminder", // Subject line
            body: `<h1>Hi,</h1><br>
            <p>
                It's a reminder that we have yet to receive payment from you regarding your domain ${domain}. Please make a payment or subscribe to a plan. Thank You!
            </p>`
        };
        const success = await sendEmail(mailOptions)
        if(success)
        {
            res.status(201).json({
                message: "Reminder email sent successfully",
            });
        } else {
            res.status(400).json({
                error: "Error sending reminder email",
            });
        } 
    } catch (e) {
        res.status(400).send(e)
    }
}

exports.sendSmsReminder = async (req,res) => {
    const {email,domain} = req.body;
    try {
        Users.findOne({ Email: email }, async (err,user) =>{
            if(err){
                return res.status(400).json({error: "Error finding user"});
            }
            else if(!user){
                return res.status(400).json({error: "User not found"});
            }
            else {
                client.messages
                .create({
                    body: `It's a reminder that we have yet to receive payment from you regarding your domain ${domain}. Please make a payment or subscribe to a plan. Thank You!`,
                    from: '+17407213240',
                    to: '+923135309758' // user.PhoneNo
                })
                .then(message => {
                    console.log(message.sid)
                    res.status(201).json({
                        message: "Reminder SMS sent successfully",
                    });
                }).catch(err => {
                    console.log(err)
                    res.status(400).json({
                        error: "Error sending reminder SMS",
                    });
                });
            }
        })
    } catch (e) {
        res.status(400).send(e)
    }
}

exports.sendWhatsAppMsgReminder = async (req,res) => {
    const {email,domain} = req.body;
    try {
        Users.findOne({ Email: email }, async (err,user) =>{
            if(err){
                return res.status(400).json({error: "Error finding user"});
            }
            else if(!user){
                return res.status(400).json({error: "User not found"});
            }
            else {
                client.messages
                .create({
                    body: `It's a reminder that we have yet to receive payment from you regarding your domain ${domain}. Please make a payment or subscribe to a plan. Thank You!`,
                    from: 'whatsapp:+14155238886',
                    to: 'whatsapp:+14155238886' // user.PhoneNo
                })
                .then(message => {
                    console.log(message.sid)
                    res.status(201).json({
                        message: "Reminder WhatsApp message sent successfully",
                    });
                }).catch(err => {
                    console.log(err)
                    res.status(400).json({
                        error: "Error sending reminder WhatsApp message",
                    });
                });
            }
        })
    } catch (e) {
        res.status(400).send(e)
    }
}

exports.sendBulkMsgs = (req,res) => {
    const numbers = ['+923135309758','+923418950891']
    // client.notify.services("MG6c9619a8a4ffd9621586683bdea1dd29")
    // .notifications.create({
    //     toBinding: JSON.stringify({
    //         binding_type: 'sms', address: '+923135309758',
    //         binding_type: 'sms', address: '+923418950891',
    //     }),
    //     body: 'First bulk msg'
    // })
    // .then(n => console.log(n.sid))
    // .catch(err => console.log(err))
    Promise.all(
        numbers.map(number => {
          return client.messages.create({
            to: number,
            from: 'MG6c9619a8a4ffd9621586683bdea1dd29',
            body: 'First bulk msg'
          });
        })
    )
    .then(messages => {
        console.log('Messages sent! ',messages.sid);
    })
    .catch(err => console.log(err));
}