const express = require('express');
const router = express.Router();
const { Track } = require('../mongoose.models/member');


router.get("/getAllTracks",async(req,res)=>{
    try {
        
    const AllTracks=await Track.find({});
    res.status(200).json({message:"get data successfully ",data:AllTracks})

    } catch (error) {
            res.status(400).json({message:error.message})
    }
})

router.get("/getCourses/:id",async(req,res)=>{
    try {
      const id=  req.params.id;
    const track=await Track.findById(id);
    const courses= track.courses;
    res.status(200).json({message:"get data successfully ",data:courses})

    } catch (error) {
            res.status(400).json({message:error.message})
    }
})

router.get("/course/:Tid/:Cid/tasks",async(req,res)=>{
    try {
      const {Tid,Cid}=req.params;
      console.log(Tid,Cid);
      
      const track=await Track.findById(Tid);
      const courses= track.courses;
      console.log(courses)

      course=courses.id(Cid);
      console.log(course);

      tasks=course.tasks

      console.log(tasks)
      
   
    res.status(200).json({message:"get data successfully ",data:tasks})

    } catch (error) {
            res.status(400).json({message:error.message})
    }
})


// إضافة تراك جديد
router.post('/add', async (req, res) => {
  try {
    const { name, description } = req.body;
    const newTrack = new Track({ name, description });
    await newTrack.save();
    res.status(201).json({ message: 'Track added successfully', track: newTrack });
  } catch (err) {
    res.status(500).json({ message: 'Error adding track', error: err.message });
  }
});

// تعديل تراك
router.put('/update/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const updates = req.body;
    const updatedTrack = await Track.findByIdAndUpdate(trackId, updates, { new: true });
    res.status(200).json({ message: 'Track updated successfully', track: updatedTrack });
  } catch (err) {
    res.status(500).json({ message: 'Error updating track', error: err.message });
  }
});

// حذف تراك
router.delete('/delete/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    await Track.findByIdAndDelete(trackId);
    res.status(200).json({ message: 'Track deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting track', error: err.message });
  }
});

// إضافة كورس إلى تراك معين
router.post('/:trackId/course/add', async (req, res) => {
  try {
    const { trackId } = req.params;
    const { name, description } = req.body;
    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    track.courses.push({ name, description });
    await track.save();
    res.status(201).json({ message: 'Course added successfully', track });
  } catch (err) {
    res.status(500).json({ message: 'Error adding course', error: err.message });
  }
});

// تعديل كورس
router.put('/:trackId/course/update/:courseId', async (req, res) => {
  try {
    const { trackId, courseId } = req.params;
    const updates = req.body;
    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    const course = track.courses.id(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    Object.assign(course, updates);
    await track.save();
    res.status(200).json({ message: 'Course updated successfully', track });
  } catch (err) {
    res.status(500).json({ message: 'Error updating course', error: err.message });
  }
});

// حذف كورس
router.delete('/:trackId/course/delete/:courseId', async (req, res) => {
  try {
    const { trackId, courseId } = req.params;
    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ message: 'Track not found' });
    
    const result = await Track.updateOne(
      { _id: trackId },
      { $pull: { courses: { _id: courseId } } }
    );
    
    if (result.modifiedCount > 0) {
      console.log("Course removed successfully.");
    } else {
      console.log("No course found with the given ID.");
    }
    
    // const course=await track.courses.id(courseId)
    // if (course) {
    //   course.remove(); // Use remove() to mark it for removal
    //   await track.save(); // Save the parent document to persist changes
    //   console.log("Course removed successfully.");
    // } else {
    //   console.log("Course not found.");
    // }
    
    // console.log("ddone");
    
    await track.save();
    res.status(200).json({ message: 'Course deleted successfully', track });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting course api', error: err.message });
  }
});

// إضافة تاسك إلى كورس معين
router.post('/:trackId/course/:courseId/task/add', async (req, res) => {
  try {
    const { trackId, courseId } = req.params;
    const { name, description,time,score,materialLink, } = req.body;

    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    const course = track.courses.id(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.tasks.push({ name, description, time,score,materialLink });
    await track.save();
    res.status(201).json({ message: 'Task added successfully', track });
  } catch (err) {
    res.status(500).json({ message: 'Error adding task', error: err.message });
  }
});

// تعديل تاسك
router.put('/:trackId/course/:courseId/task/update/:taskId', async (req, res) => {
  try {
    const { trackId, courseId, taskId } = req.params;
    const updates = req.body;

    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    const course = track.courses.id(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const task = course.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    Object.assign(task, updates);
    await track.save();
    res.status(200).json({ message: 'Task updated successfully', track });
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
});

// حذف تاسك
router.delete('/:trackId/course/:courseId/task/delete/:taskId', async (req, res) => {
  try {
    const { trackId, courseId, taskId } = req.params;

    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ message: 'Track not found' });

    const course = track.courses.id(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const result = await Track.updateOne(
      { _id: trackId },
      {  courses: { _id: courseId }  },
      { $pull: { tasks: { _id: taskId } } }
    );
    
    // course.tasks.id(taskId).remove();
    await track.save();
    res.status(200).json({ message: 'Task deleted successfully', track });
  } catch (err) {
    console.log(err.message);
    
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
});

module.exports = router;
