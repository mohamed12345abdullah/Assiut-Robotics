const mongoose=require('mongoose');
const validator=require('validator');





// const taskSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   time:String,
//   score:String,
//   materialLink: String,
//   // evaluation: String, // تقييم المسؤول
// });

// const courseSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   tasks: [taskSchema], // كل كورس يحتوي على مجموعة من التاسكات
// });

// const trackSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   courses: [courseSchema], // كل تراك يحتوي على مجموعة من الكورسات
//   committee:String,
//   members:[
//     {}
//   ]
// });




const memberTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: Date,
  deadline:Date,
  submissionDate:Date,
  taskUrl:String,
  submissionLink:{type:String,
    default:"*"
  },
  headEvaluation:{
    type:Number,
    default:-1
  }  ,
  headPercent:{
    type:Number,
    default:0
  }  ,
  hrEvaluation:{
    type:Number,
    default:-1
  }, 
  hrPercent:{
    type:Number,

  }  ,
  rate:Number,
  points:Number,

});

memberTaskSchema.pre("save", function (next) {
  this.hrPercent = 100 - this.headPercent; // حساب نسبة الـ HR تلقائيًا
  next();
});



const memberSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        validate:[validator.isEmail,"enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"password is required"],

    },
    committee:{
        type:String,
        required:[true,"committee is required"]
    },
    gender:{
        type:String,
        required:[true,"gender is required"]
    },
    phoneNumber:{
        type:String,
        required:[true,"phone number is required"],
        validate:[validator.isMobilePhone,"enter a valid phone number"]
    },
    role:{
        type:String,
        default:"not accepted"
    },
    avatar:{
        type:String,
        default:"../all-images/default.png"
    },
    rate:{
        type:Number,
    },
    alerts:{
        type:Number
    },
    warnings:{
        type:Number
    },
    verified :{
        type:Boolean,
        default:false
    },
    secretKey:{
        type:String,
    },
    startedTracks: [
        {
          track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
          courses: [
            {
              course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
              submittedTasks: [
                {
                  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
                  submissionLink: String,
                  submittedAt: {
                    type:Date,
                    default:Date.now()
                  }
                    ,
                  rate:String,
                  notes:String,
                },
              ],
            },
          ],
        },
      ],

      tasks:[memberTaskSchema]
})

const member = mongoose.model('Member', memberSchema);


module.exports =  member