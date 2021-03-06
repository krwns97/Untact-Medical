const showRouter = require("express").Router()
const { captureRejectionSymbol } = require("events")
const fs = require("fs")

showRouter.get("/", (req, res) => {
  if (!req.query.mode) {
    try {
      if (req.query.dirName == undefined || req.query.num <= 0) {
        return res.send("wrong")
      }
      const filePath =
        "images/" + req.query.dirName + "/" + req.query.num + ".png"
      const filestream = fs.createReadStream(filePath)
      filestream.pipe(res)
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  }else{
    try {
      if (req.query.dirName == undefined || req.query.num <= 0) {
        return res.send("wrong")
      }
      const filePath =
        "images/" + req.query.dirName + "/"+ "predict_result"+ "/result_" + req.query.num + "_OUT.png"
      const filestream = fs.createReadStream(filePath)
      filestream.pipe(res)
    } catch (err) {
      console.log(err)
      res.send(err)
    }
  }
})

module.exports = showRouter
