import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type {Freet} from '../freet/model';

/**
 * This file defines the properties stored in a Vote and a ReferenceLink
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Vote on the backend
export type Vote = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  freetId: Types.ObjectId;
  issuerId: Types.ObjectId;
  credible: boolean;
};

export type PopulatedVote = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  freetId: Freet;
  issuerId: User;
  credible: boolean;
};

// Type definition for ReferenceLink on the backend
export type ReferenceLink = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  freetId: Types.ObjectId;
  issuerId: Types.ObjectId;
  link: string;
};

export type PopulatedReferenceLink = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  freetId: Freet;
  issuerId: User;
  link: string;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Votes stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const VoteSchema = new Schema<Vote>({
  freetId: {
    type: Schema.Types.ObjectId,
    ref: 'Freet',
    required: true
  },
  issuerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  credible: {
    type: Boolean,
    required: true
  }
});

// Mongoose schema definition for interfacing with a MongoDB table
// ReferenceLinks stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const ReferenceLinkSchema = new Schema<ReferenceLink>({
  freetId: {
    type: Schema.Types.ObjectId,
    ref: 'Freet',
    required: true
  },
  issuerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  link: {
    type: String,
    required: true
  }
});

export const VoteModel = model<Vote>('Vote', VoteSchema);
export const ReferenceLinkModel = model<ReferenceLink>('ReferenceLink', ReferenceLinkSchema);
