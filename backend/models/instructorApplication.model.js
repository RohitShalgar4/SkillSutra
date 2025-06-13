import mongoose from 'mongoose';

const instructorApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  expertiseArea: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true
  },
  whyTeach: {
    type: String,
    required: true
  },
  qualifications: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
instructorApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const InstructorApplication = mongoose.model('InstructorApplication', instructorApplicationSchema);

export default InstructorApplication; 