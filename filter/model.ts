import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type {Tag} from '../tag/model';

/**
 * This file defines the properties stored in a Filter
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Filter on the backend
export type Filter = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  creator: Types.ObjectId;
  name: string;
  usernames: Types.ObjectId[];
  tags: Types.ObjectId[];
};

export type PopulatedFilter = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  creator: User;
  name: string;
  usernames: User[];
  tags: Tag[];
};

// Mongoose schema definition for interfacing with a MongoDB table
// Filters stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const FilterSchema = new Schema<Filter>({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  usernames: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    required: true
  },
  tags: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }],
    required: true
  }
});

const FilterModel = model<Filter>('Filter', FilterSchema);
export default FilterModel;
