import type {HydratedDocument, Types} from 'mongoose';
import type {Taglist} from './model';
import TaglistModel from './model';

/**
 * This files contains a class that has the functionality to explore taglists
 * stored in MongoDB, including getting, adding, updating, and deleting taglists.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Taglist> is the output of the TaglistModel() constructor,
 * and contains all the information in Taglist. https://mongoosejs.com/docs/typescript.html
 */
class TaglistCollection {
  /**
   * Get the taglist associated with a freetId
   *
   * @param {string} freetId - The id of the freet
   * @return {Promise<HydratedDocument<Taglist>> | Promise<null> } - The taglist of the freet with the given freetId, if any
   */
  static async findOne(freetId: Types.ObjectId | string): Promise<HydratedDocument<Taglist>> {
    return TaglistModel.findOne({_id: freetId}).populate('freetId');
  }

  /**
   * Add a taglist to the collection
   *
   * @param {string} freetId - The id of the freet that the tags will be associated with
   * @param {string[]} tags - The list of tags
   * @return {Promise<HydratedDocument<Taglist>>} - The newly created Taglist
   */
  static async addOne(freetId: Types.ObjectId | string, tags: string[]): Promise<HydratedDocument<Taglist>> {
    const taglist = new TaglistModel({
      freetId,
      tags
    });
    await taglist.save(); // Saves freet to MongoDB
    return taglist.populate('freetId');
  }

  /**
   * Update a taglist with the new tags
   *
   * @param {string} freetId - The id of the freet whose taglist is to be updated
   * @param {string[]} tags - The new tags to be associated with that freet
   * @return {Promise<HydratedDocument<Taglist>>} - The newly updated taglist
   */
  static async updateOne(freetId: Types.ObjectId | string, tags: string[]): Promise<HydratedDocument<Taglist>> {
    const taglist = await TaglistModel.findOne({_id: freetId});
    taglist.tags = tags;
    await taglist.save();
    return taglist.populate('freetId');
  }

  /**
   * Delete the taglist associated with given freetId.
   *
   * @param {string} freetId - The freetId of freet whose taglist is to be deleted
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(freetId: Types.ObjectId | string): Promise<boolean> {
    const taglist = await TaglistModel.deleteOne({_id: freetId});
    return taglist !== null;
  }
}

export default TaglistCollection;