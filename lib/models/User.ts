import mongoose, { Schema, Model } from 'mongoose';

interface IUser {
  email: string;
  password: string;
  role: 'client' | 'admin';
  clientId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client',
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;