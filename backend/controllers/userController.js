const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const { use } = require('../routes/userRoutes')
const jwt = require('jsonwebtoken')

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if(!name || !email || !password) {
        res.status(400)
        throw new Error('Fields cannot be empty')
    } else {

        const userExists = await User.findOne({email: email})

        if(userExists){
            return res.status(400).json({"message": "user already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })
        

        return res.status(200).json({
            "_id": user._id,
            "name": user.name,
            "email": user.email  
        })
    }

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password }= req.body

    const user = await User.findOne({email})

    if(user && (await bcrypt.compare(password, user.password))){
        return res.status(200).json({
            "_id": user._id,
            "name": user.name,
            "email": user.email,
            "token":  generateToken(user._id)
        })
    } else {
        throw new Error('Invalid credentials')
    }
})


const generateToken = (id) => {
    return jwt.sign({id}, process.env.WEB_TOKEN, {
        "expiresIn": "30d"
    })
}

module.exports = {
    registerUser,
    loginUser
}