const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Users = require("../models/user");
const { env } = require('process');
const stripe = require("stripe")(process.env.STRIPE_KEY);

const FEATURES = [process.env.FEATURE_PLUGIN_ANALYTICS_COMBO]

exports.addNewSite = (req, res) => {
    const {email, domain, language, platform, feature} = req.body;
    try {
        Users.findOne({ Email: email },{ Password: 0 },async(err,user)=>{
            if(err || !user){
                return res.status(400).json({error: "Error finding user"});
            }
            if(!feature){
                return res.status(400).json({error: "Please specify feature"})
            }
            const reqFeature = feature?.toUpperCase();
            if(!FEATURES.includes(reqFeature)) {
                return res.status(400).json({error: "Requested feature not available"})
            }
            
            let isDomainExist = await user.Sites.find((site) => site.domainName === domain);
            if(typeof(isDomainExist) !== 'undefined'){    
                if(isDomainExist.Feature.includes(reqFeature)){
                    res.status(400).json({error: `A subscription for ${reqFeature} already exist! Try using another`})
                } else {
                    isDomainExist.stripeSubscriptionId.push('');
                    isDomainExist.isActive.push(false);
                    isDomainExist.Feature.push(reqFeature)
                }
            } else {
                site = {
                    domainName: domain,
                    Language: language,
                    Platform: platform,
                    Script: [],
                    stripeSubscriptionId: [''],
                    isActive: [false],
                    Feature : [reqFeature],
                }
                user.Sites.push(site)
            }
            user.save().then(data => {
                scriptHandler(data._id,domain,reqFeature,res)
                }).catch(err => {
                    console.log("Error ",err)
                  res.status(404).send(err)
            });
        })
    } catch(e){
        console.log(e)
        res.status(400).send(e)
    }
}

const scriptHandler = (userId, domain,reqFeature,res) => {
    Users.findOne({ _id: userId }, async (err, user) => {
        if (err) {
          console.log("Error finding user" );
        } else if (!user) {
          console.log("User not found" );
        }
        let result = user.Sites.find((site) => site.domainName === domain);
        let index = result.Feature.indexOf(reqFeature)
        const script = `<script> window.interdeal = { "sitekey": "${result._id}", "userId": "${userId}","feature": "${reqFeature}", "Menulang": "EN", "domains": { "js": "https://cdn.equalweb.com/", "acc": "https://access.equalweb.com/" }, "btnStyle": { "vPosition": [ "80%", null ], "scale": [ "0.8", "0.8" ], "icon": { "type": 7, "shape": "semicircle", "outline": false } } }; (function(doc, head, body){ var coreCall = doc.createElement('script'); coreCall.src = 'https://iqasimmughal.com/test.js'; coreCall.defer = true;  coreCall.setAttribute('data-cfasync', true ); body? body.appendChild(coreCall) : head.appendChild(coreCall); })(document, document.head, document.body); </script>`
        result.Script[index] = script;
        await user
          .save()
          .then((data) => {
            console.log("Script ",script)
            res.status(200).send(script)
          })
          .catch((err) => {
            console.log("Error in script handler ",err)
            res.status(400).send(err.message)
          });
      });
}

exports.sendScript = (req,res) => {
    try{
        const {email,domainName,feature} = req.body;
        Users.findOne({ Email: email }, async (err,user) =>{
            if(err || !user){
                return res.status(400).json({error: "Error finding user"});
            }
            else {
                let domain = await user?.Sites?.filter(obj => {
                    return obj.domainName === domainName
                  })
                let index = domain[0].Feature.indexOf(feature)
                
                res.status(200).send({script: domain[0].Script[index]})

                //let currentTime = new Date().getTime()/1000;

                // if((domain[0].trialEnd[index]-currentTime)/86400 < 0 && domain[0].stripeSubscriptionId[index] === '') {

                //     domain[0].trialEnd[index] !== 0 ? domain[0].trialEnd[index] = 0 : domain[0].trialEnd[index]
                //     domain[0].isActive[index] ? domain[0].isActive[index] = false : domain[0].isActive[index]

                //     user.save().then(()=>{
                //         res.status(400).send({isActive: false})
                //     })
                // }
                // else if((domain[0].isActive[index] && domain[0].stripeSubscriptionId[index] === '' && domain[0].trialEnd[index]-currentTime)/86400 > 0) {
                //     res.status(200).send({isActive: true, script: domain[0].Script[index]})
                // }
                // else if(domain[0].stripeSubscriptionId[index] !== '' && domain[0].isActive[index]) {
                //     res.status(200).send({isActive: true, script: domain[0].Script[index]})
                // } 
                // else if(!domain[0].isActive[index]){
                //     res.status(400).send({isActive: false})
                // }
                // else {
                //     res.status(400).send({isActive: false})
                // }
            }
        }) 
    } catch(e){
        res.status(404).send({error: "Error getting script"})
    }
}

exports.isValidScript = (req,res) => {
    const {domainName, userId, siteKey, feature} = req.body;
    let script = `let outerCircle = document.createElement('div'); outerCircle.classList.add('script-circle'); outerCircle.style.zIndex='9999'; outerCircle.style.backgroundColor = 'red'; outerCircle.style.position = 'fixed'; outerCircle.style.bottom = '5%'; outerCircle.style.left = '5%'; outerCircle.style.height = '50px'; outerCircle.style.width = '50px'; outerCircle.style.borderRadius = '50%'; let inner = document.createElement('p') inner.style.display = 'flex'; inner.style.alignItems = 'center'; outerCircle.append(inner); document.body.appendChild(outerCircle);`

    Users.findOne({ _id: userId }, async (err, user) => {
        if (err) {
          console.log("Error finding user" );
        } else if (!user) {
          console.log("User not found" );
        }

        if(!FEATURES.includes(feature)) {
            return res.status(400).send({error: "Invalid Feature"})
        }

        let Domain = user?.Sites?.find((site) => site.domainName === domainName && site._id == siteKey);
        if(typeof(Domain) !== 'undefined'){
            let index = Domain.Feature.indexOf(feature)
            
            if(Domain.isActive[index] && Domain.stripeSubscriptionId[index] !== '') {
                res.status(200).send({isActive: true, script: script})
            }
            else if (!Domain.isActive[index]){
                res.status(400).send({isActive: false})
            }
            else {
                res.status(400).send({isActive: false})
            } 
        }
        else {
            res.status(400).send({error: "In valid domain", isActive: false})
        }
    })
}

exports.activateScript = async(req,res) => {
    const {email, domain, feature} = req.body;
    try {
        Users.findOne({ Email: email }, async (err, user) => {
            if (err) {
              console.log("Error finding user" );
            } else if (!user) {
              console.log("User not found" );
            }
            let result = user?.Sites?.find((site) => site.domainName == domain);
            let index = result.Feature.indexOf(feature)
            if(result.stripeSubscriptionId[index] != '')
            {
                await stripe.subscriptions.update(
                    result.stripeSubscriptionId[index],
                    {
                        pause_collection: '',
                    }
                );
                result.isActive[index] = true;
                await user
                .save()
                .then(() => {
                    res.status(200).send({message: "Script Activated!"})
                })
                .catch((err) => {
                    res.status(400).send({error: "Error in updating database"})
                });
            }
            else {
                res.status(400).send({error: "Unable to activate! Please subscribe to a plan first.", isActive: false})
            }
          });  
    } catch (e) {
        res.status(404).send(e)
    }
}

exports.deActivateScript = async(req,res) => {
    const {email, domain,feature} = req.body;
    try {
        Users.findOne({ Email: email }, async (err, user) => {
            if (err) {
              console.log("Error finding user" );
            } else if (!user) {
              console.log("User not found" );
            }
            let result = user?.Sites?.find((site) => site.domainName == domain);
            let index = result.Feature.indexOf(feature)
            if(result.stripeSubscriptionId[index] != '')
            {
                await stripe.subscriptions.update(
                    result.stripeSubscriptionId[index],
                    {pause_collection: {behavior: 'void'}}
                );
                result.isActive[index] = false;
                await user
                .save()
                .then(() => {
                    res.status(200).send({message: "Script Deactivated!"})
                })
                .catch((err) => {
                    res.status(400).send({error: "Error in updating database"})
                });
            }
            else {
                res.status(400).send({error: "Already deactivate! Please subscribe to a plan.", isActive: false})
            }
          });  
    } catch (e) {
        res.status(404).send(e)
    }
}
