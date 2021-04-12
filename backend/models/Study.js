const mongoose = require("mongoose");

const StudySchema = new mongoose.Schema({
    StudyID:{type:String,unique:true, required: true},
    PatientID: { type: String, required: true },
    PatientName: { type: String, required: true },
    PatientAge: { type: String, required: true }, 
    PatientBirthDate: { type: String, required: true },
    PatientSex: { type: String, required: true },
    StudyData: { type: String, required: true },
    Modality: { type: String, required: true },
    StudyDescription: { type: String, required: true },
    ReferringPhysicianName: { type: String, required: true },
    NumberOfImg: { type: String, required: true },
    URL: {type:String,required:true},
});

const Study = mongoose.model("Study",StudySchema);
module.exports={Study};