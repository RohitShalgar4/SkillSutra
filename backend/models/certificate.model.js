// models/certificate.model.js
import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true 
    },
    completionDate: { 
        type: Date,
        default: Date.now 
    },
    certificateNumber: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['generated', 'revoked'],
        default: 'generated'
    }
}, { timestamps: true });

// Generate unique certificate number before saving
certificateSchema.pre('save', async function(next) {
    if (!this.certificateNumber) {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        this.certificateNumber = `SKILL-${year}-${random}`;
    }
    next();
});

const Certificate = mongoose.model('Certificate', certificateSchema);
export { Certificate };
export default Certificate;