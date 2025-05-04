import { Schema, model, models } from 'mongoose';

const PatientDataSchema = new Schema({
  scannerManufacturer: { type: String, required: true },
  scannerModel: { type: String, required: true },
  month: { type: Number, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  modality: { type: String, required: true },
  examDescription: { type: String, required: true },
  projection: { type: String, required: true },
  aecManual: { type: String, required: true },
  kvp: { type: Number, required: true },
  mas: { type: Number, required: true },
  dap: { type: Number, required: true },
  grid: { type: String, required: true },
  focalSpot: { type: Number, required: true },
  sid: { type: Number, required: true },
  collimation: { type: Number, required: true },
  tubeOutput: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PatientData = models.PatientData || model('PatientData', PatientDataSchema);

export default PatientData; 