import Notification from "../model/notif.js";

export const getnotif = async (req,res)=>{
    try{
        const notifications = await Notification.find().sort({ createdAt: -1})
        res.status(200).json({ success: true, data:notifications})
    }catch (error){
        res.status(500).json({ success: false, message: "Server Error"})
    }
}

export const addnotif = async (req,res)=>{
    try {
        const {title, message} = req.body
        const newNotification = new Notification({ title, message})
        await newNotification.save()
        res.status(201).json({ success: true, data: newNotification })
    }catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
      }
    };