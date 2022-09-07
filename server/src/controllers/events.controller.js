const EventsModel = require('../models/events');
const UserModel = require('../models/user');

exports.addEvents = async (req,res) => {
    try {
        const {userId, siteKey, events} = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        await EventsModel.findOne({ _userId: userId, _siteId: siteKey }).exec((err, event)=>{
            if(err) {
                res.status(400).json({error: `Error: ${err.message}`})
            }
            else if(event) {              
             //   event.events = event.events.concat(events)
                let updateEvent = {
                    ...events,
                    ipAddress: ip
                }
                event.events.push(updateEvent)
                event.save((err,data)=>{
                    if(err){
                        console.log("Error in saving events: ",err.message)
                        res.status(400).json({error: `Error in saving events ${err.message}`})
                    }
                    else if(data){
                        res.status(200).json({message: `Events saved successfully`})
                    }
                })
            }
            else{
                let updateEvent = {
                    ...events,
                    ipAddress: ip
                }
                let newEvent = new EventsModel({
                    _userId: userId,
                    _siteId: siteKey,
                    events: updateEvent,
                })
                newEvent.save((err,data)=>{
                    if(err){
                        console.log("Error in saving events: ",err.message)
                        res.status(400).json({error: `Error in saving events ${err.message}`})
                    }
                    else if(data){
                        res.status(200).json({message: `Events saved successfully`})
                    }
                })
            }
        })
    } catch (e) {
        res.status(400).json({error: `Error: ${e.message}`})
    }
}

exports.getEvents = async(req,res) => {
    try {
        const { email, domainName } = req.body;
        UserModel.findOne({ Email: email }, async (err,user)=>{
            if(err) {
                console.log("Error ",err)
                return res.status(400).json({error: `Error: ${err.message}`})
            }
            else if(!user) {
                return res.status(400).json({
                    error: "Email not Registered. Please Sign Up!"
                })
            } else {
                let result = user?.Sites?.find((site) => site.domainName == domainName);
                await EventsModel.findOne({ _userId: user._id, _siteId: result._id }).exec((err, event)=>{
                    if(err) {
                        return res.status(400).json({error: `Error: ${err.message}`})
                    }
                    else if(!event) {    
                        return res.status(500).json({error: "No events found"})
                    }
                    else{
                        return res.status(200).json({events: event.events})
                    }
                })
            }
        })
    } catch (e) {
        res.status(400).json({error: `Error: ${e.message}`})
    }
}