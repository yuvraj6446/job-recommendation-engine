const mongoose = require('mongoose');


const candidateSchema=new mongoose.Schema({
    
    name:
    {
        type:String,
        required:true,
    },
    skills:
    {
                type:[String],
                required:true,
        
    },
    yearsOfExperience:
    {
        type:Number,
        required:true,
        min:0,
    },
    location:
    {
        type:String,
        required:true,
        trim:true,
    },
    expectedSalary:
    {
        type:Number,
        required:true,
        min:0,
    },
},
{
    timestamps:true,
}
);

module.exports=mongoose.model('Candidate',candidateSchema);