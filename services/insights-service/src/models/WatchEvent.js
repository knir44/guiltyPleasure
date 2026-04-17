import mongoose from 'mongoose';

const watchEventSchema = new mongoose.Schema({
  content_id:    { type: Number, required: true },
  title:         { type: String, required: true },
  type:          { type: String, enum: ['movie', 'show'] },
  genre:         { type: String },
  rating:        { type: Number, min: 1, max: 10 },
  finished_date: { type: Date },
  created_at:    { type: Date, default: Date.now },
});

export default mongoose.model('WatchEvent', watchEventSchema);
