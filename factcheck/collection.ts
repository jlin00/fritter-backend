import type {HydratedDocument, Types} from 'mongoose';
import type {Vote, ReferenceLink} from './model';
import {VoteModel} from './model';
import {ReferenceLinkModel} from './model';

/**
 * This files contains a class that has the functionality to explore votes and reference links
 * stored in MongoDB, including adding, finding, updating, and deleting votes and reference links.
 * Feel free to add additional operations in this file.
 */
export class VoteCollection {
  /**
   * Add a credibility vote to given freet
   *
   * @param {string} freetId - The id of the freet
   * @param {string} issuerId - The id of the user issuing the vote
   * @param {boolean} credible - Whether or not the vote is credible or uncredible
   * @return {Promise<HydratedDocument<Vote>>} - The newly created vote
   */
  static async addOne(freetId: Types.ObjectId | string, issuerId: Types.ObjectId | string, credible: boolean): Promise<HydratedDocument<Vote>> {
    const vote = new VoteModel({
      freetId,
      issuerId,
      credible
    });
    await vote.save(); // Saves vote to MongoDB
    return vote.populate(['freetId', 'issuerId']);
  }

  /**
   * Delete credibility vote
   *
   * @param {string} freetId - The id of the freet
   * @param {string} issuerId - The id of the issuer
   * @return {Promise<Boolean>} - true if the vote has been deleted, false otherwise
   */
  static async deleteOne(freetId: Types.ObjectId | string, issuerId: Types.ObjectId | string): Promise<boolean> {
    const vote = await VoteModel.deleteOne({freetId, issuerId});
    return vote !== null;
  }

  /**
   * Get all votes belonging to a given freet
   *
   * @param {string} freetId - The id of the freet
   * @returns {Promise<HydratedDocument<Vote>[]>} - An array of all votes belonging to freet
   */
  static async findAllByFreetId(freetId: Types.ObjectId | string): Promise<Array<HydratedDocument<Vote>>> {
    return VoteModel.find({freetId}).populate(['freetId', 'issuerId']);
  }

  /**
   * Get vote belonging to given freet from given user
   *
   * @param {string} freetId - The id of the freet
   * @param {string} issuerId - The id of the issuer
   * @returns {Promise<HydratedDocument<Vote>>} - The vote object
   */
  static async findOneByFreetIdAndIssuerId(freetId: Types.ObjectId | string, issuerId: Types.ObjectId | string): Promise<HydratedDocument<Vote>> {
    return VoteModel.findOne({freetId, issuerId}).populate(['freetId', 'issuerId']);
  }
}

export class ReferenceLinkCollection {
  /**
   * Add a reference link to given freet
   *
   * @param {string} freetId - The id of the freet
   * @param {string} issuerId - The id of the user issuing the reference link
   * @param {string} link - The reference link
   * @return {Promise<HydratedDocument<ReferenceLink>>} - The newly created reference link object
   */
  static async addOne(freetId: Types.ObjectId | string, issuerId: Types.ObjectId | string, link: string): Promise<HydratedDocument<ReferenceLink>> {
    const refLink = new ReferenceLinkModel({
      freetId,
      issuerId,
      link
    });
    await refLink.save(); // Saves reference link to MongoDB
    return refLink.populate(['freetId', 'issuerId']);
  }

  /**
   * Find a reference link by id
   *
   * @param {string} linkId - The id of the reference link
   * @return {Promise<HydratedDocument<ReferenceLink>} - The reference link
   */
  static async findOne(linkId: Types.ObjectId | string): Promise<HydratedDocument<ReferenceLink>> {
    return ReferenceLinkModel.findOne({_id: linkId}).populate(['freetId', 'issuerId']);
  }

  /**
   * Delete reference link
   *
   * @param {string} refLinkId - The id of the reference link
   * @return {Promise<Boolean>} - true if the reference link has been deleted, false otherwise
   */
  static async deleteOne(refLinkId: Types.ObjectId | string): Promise<boolean> {
    const refLink = await ReferenceLinkModel.deleteOne({_id: refLinkId});
    return refLink !== null;
  }

  /**
   * Get all reference links belonging to a given freet
   *
   * @param {string} freetId - The id of the freet
   * @returns {Promise<HydratedDocument<ReferenceLink>[]>} - An array of all reference links belonging to freet
   */
  static async findAllByFreetId(freetId: Types.ObjectId | string): Promise<Array<HydratedDocument<ReferenceLink>>> {
    return ReferenceLinkModel.find({freetId}).populate(['freetId', 'issuerId']);
  }
}
