const jwt = require("jsonwebtoken")
const config = require("./config")
const User = require("../models/User")
const { PythonShell } = require("python-shell")
const path = require("path")
const fs = require("fs")

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization")
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    req.token = authorization.substring(7)
  } else {
    req.token = null
  }

  next()
}
const userExtractor = async (req, res, next) => {
  const token = req.token
  try {
    const decodedToken = await jwt.verify(token, config.secret)
    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: "token missing or invalid" })
    }
    const user = await User.findById(decodedToken.id)
    req.user = user
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
  next()
}

const predictMiddleware = async (req, res)=>{
  try{
    let options = {
      scriptPath:"",
      args:[""],
    }
    options.args = ["-m","../AI_predict_/MODEL.pth","-i","images/" + req.study_id]
    PythonShell.run("../AI_predict_/predict.py",options, async (err,data)=>{
      if(err) throw err
      console.log(data)
    })
  }catch(err){
    console.log(err)
  }
}

module.exports = {
  tokenExtractor,
  userExtractor,
  predictMiddleware
}
