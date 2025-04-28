import express from 'express';
import User from ".'./model/User.js'
";
import axios from 'axios'
import {verifyToken} from '../middleware/verifyToken'

router.post ("/sendhrdata", verifyToken ,async(req,res) => {
    try {
        const user = await User.findbyId(req.user.id)

        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        if(user.department ==="HR"){
            const userData = {
                id:user._id,
                name:user.name,
                email:user.email,
                department:user.department
            }
            const response = await axios.post('http://localhost:5000/api/hr/senddata',userData, {
                headers:{
                    Authorization:`Bearer ${req.headers.authorization.split(' ')[1]}`
                }
            })
            return res.status(200).json({message:"user data sent to hr system",data:response.data})
        }else{
            return res. status(403).json({message:"access denied"})
        }
    }catch(error){
        console.error("error sending user data:", error)
        return res.status(500).josn({message:"internal server error"})
    }
})