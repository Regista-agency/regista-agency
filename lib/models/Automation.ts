import mongoose, { Schema, Model } from 'mongoose';

interface IAutomation {
  name: string;
  description: string;
  clientId: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const AutomationSchema = new Schema<IAutomation>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Automation: Model<IAutomation> = mongoose.models.Automation || mongoose.model<IAutomation>('Automation', AutomationSchema);

export default Automation;