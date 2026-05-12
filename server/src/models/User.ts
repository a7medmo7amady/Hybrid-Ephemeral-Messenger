import mongoose, { type Document, Schema } from "mongoose";

export interface IUser extends Document {
	uid: string;
	displayName: string;
	photoURL: string;
	createdAt: Date;
}

const UserSchema: Schema = new Schema({
	uid: { type: String, required: true, unique: true },
	displayName: { type: String, required: true },
	photoURL: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
