import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {Freet} from 'freet/model';
import type {Tag} from 'tag/model';

/**
 * This file defines the properties stored in a Taglist
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Taglist on the backend
export type Taglist = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  freetId: Types.ObjectId;
  tags: Types.ObjectId[];
};

export type PopulatedTaglist = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  freetId: Freet;
  tags: Tag[];
};

// Mongoose schema definition for interfacing with a MongoDB table
// Taglists stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const TaglistSchema = new Schema<Taglist>({
  // The freet freetId
  freetId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Freet'
  },
  // The tags associated with the freet
  tags: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }],
    required: true
  }
});

const TaglistModel = model<Taglist>('Taglist', TaglistSchema);
export default TaglistModel;
