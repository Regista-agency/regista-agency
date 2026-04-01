import mongoose, { Schema, Model } from 'mongoose';

interface IClient {
  name: string;
  createdAt: Date;
}

const ClientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;