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
   * Get the taglist associated with a freetId.
   *
   * @param {string} id - The id of the freet
   * @return {Promise<HydratedDocument<Taglist>> | Promise<null> } - The taglist of the freet with the given freetId, if any
   */
  static async findOne(id: Types.ObjectId | string): Promise<HydratedDocument<Taglist>> {
    return TaglistModel.findOne({freetId: id}).populate(['freetId', 'tags']);
  }

  /**
   * Add a taglist to the collection.
   *
   * @param {string} id - The id of the freet that the tags will be associated with
   * @param {string[]} tags - The list of ids associated with each tag
   * @return {Promise<HydratedDocument<Taglist>>} - The newly created Taglist
   */
  static async addOne(id: Types.ObjectId | string, tags: Types.ObjectId[]): Promise<HydratedDocument<Taglist>> {
    const taglist = new TaglistModel({
      freetId: id,
      tags
    });
    await taglist.save(); // Saves taglist to MongoDB
    return taglist.populate(['freetId', 'tags']);
  }

  /**
   * Update the taglist associated with a freetId with the new tags.
   *
   * @param {string} id - The id of the freet whose taglist is to be updated
   * @param {string[]} tags - The new tags to be associated with that freet
   * @return {Promise<HydratedDocument<Taglist>>} - The newly updated taglist
   */
  static async updateOne(id: Types.ObjectId | string, tags: Types.ObjectId[]): Promise<HydratedDocument<Taglist>> {
    const taglist = await TaglistModel.findOne({freetId: id});
    taglist.tags = tags;
    await taglist.save();
    return taglist.populate(['freetId', 'tags']);
  }

  /**
   * Delete the taglist associated with a freetId.
   *
   * @param {string} id - The freetId of freet whose taglist is to be deleted
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(id: Types.ObjectId | string): Promise<boolean> {
    const taglist = await TaglistModel.deleteOne({freetId: id});
    return taglist !== null;
  }
}

export default TaglistCollection;
