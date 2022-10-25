import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

/**
 * This file defines the properties stored in a Tag
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Tag on the backend
export type Tag = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  tag: string;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Tags stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const TagSchema = new Schema<Tag>({
  tag: {
    type: String,
    required: true
  }
});

const TagModel = model<Tag>('Tag', TagSchema);
export default TagModel;
