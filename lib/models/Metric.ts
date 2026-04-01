import mongoose, { Schema, Model } from 'mongoose';

interface IMetric {
  automationId: mongoose.Types.ObjectId;
  date: Date;
  emailsSent: number;
  conversions: number;
  revenue: number;
}

const MetricSchema = new Schema<IMetric>({
  automationId: {
    type: Schema.Types.ObjectId,
    ref: 'Automation',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  emailsSent: {
    type: Number,
    default: 0,
  },
  conversions: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
});

MetricSchema.index({ automationId: 1, date: 1 });

const Metric: Model<IMetric> = mongoose.models.Metric || mongoose.model<IMetric>('Metric', MetricSchema);

export default Metric;