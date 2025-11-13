import { Schema, model } from 'mongoose';

const studentSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  busId: {
    type: Schema.Types.ObjectId,
    ref: 'Bus',
    required: true,
  },
  parentContact: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
});

const Student = model('Student', studentSchema);

export default Student;