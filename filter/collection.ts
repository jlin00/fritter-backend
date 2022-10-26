import type {HydratedDocument, Types} from 'mongoose';
import type {Filter} from './model';
import FilterModel from './model';

/**
 * This files contains a class that has the functionality to explore filters
 * stored in MongoDB, including adding, finding, updating, and deleting filters.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Filter> is the output of the FilterModel() constructor,
 * and contains all the information in Filter. https://mongoosejs.com/docs/typescript.html
 */
class FilterCollection {
  /**
   * Add a filter to the collection
   *
   * @param {string} userId - The creator of the filter
   * @param {string} name - The name of the filter
   * @param {string[]} usernames - The usernames to filter for
   * @param {string[]} tags - The tags to filter for
   * @return {Promise<HydratedDocument<Filter>>} - The newly created filter
   */
  static async addOne(userId: Types.ObjectId | string, name: string, usernames: Types.ObjectId[], tags: Types.ObjectId[]): Promise<HydratedDocument<Filter>> {
    const filter = new FilterModel({
      creator: userId,
      name,
      usernames,
      tags
    });
    await filter.save(); // Saves filter to MongoDB
    return filter.populate(['creator', 'usernames', 'tags']);
  }

  /**
   * Find a filter by filterId
   *
   * @param {string} filterId - The id of the filter to find
   * @return {Promise<HydratedDocument<Filter>>} - The filter with the given filterId, if any
   */
  static async findOne(filterId: Types.ObjectId | string): Promise<HydratedDocument<Filter>> {
    return FilterModel.findOne({_id: filterId}).populate(['creator', 'usernames', 'tags']);
  }

  /**
   * Update a filter with new parameters
   *
   * @param {string} filterId - The id of the filter to be updated
   * @param {string} name - The new name of the filter
   * @param {string[]} usernames - The new usernames to filter for
   * @param {string[]} tags - The new tags to filter for
   * @return {Promise<HydratedDocument<Filter>>} - The newly updated filter
   */
  static async updateOne(filterId: Types.ObjectId | string, name: string, usernames: Types.ObjectId[], tags: Types.ObjectId[]): Promise<HydratedDocument<Filter>> {
    const filter = await FilterModel.findOne({_id: filterId});
    filter.name = name;
    filter.usernames = usernames;
    filter.tags = tags;
    await filter.save();
    return filter.populate(['creator', 'usernames', 'tags']);
  }

  /**
   * Delete a filter with given filterId.
   *
   * @param {string} filterId - The id of filter to delete
   * @return {Promise<Boolean>} - true if the filter has been deleted, false otherwise
   */
  static async deleteOne(filterId: Types.ObjectId | string): Promise<boolean> {
    const filter = await FilterModel.deleteOne({_id: filterId});
    return filter !== null;
  }

  /**
   * Get all filters belonging to a given user id.
   *
   * @param {string} userId - The id of the user
   * @returns {Promise<HydratedDocument<Filter>[]>} - An array of all filters belonging to user
   */
  static async findAllByUserId(userId: Types.ObjectId | string): Promise<Array<HydratedDocument<Filter>>> {
    return FilterModel.find({creator: userId}).populate(['creator', 'usernames', 'tags']);
  }

  /**
   * Get filter belong to a given user id with given name.
   *
   * @param {string} userId - The id of the user
   * @param {string} name - The name of the filter
   * @returns {Promise<HydratedDocument<Filter>>} - The filter with the given name belonging to user
   */
  static async findOneByUserIdAndName(userId: Types.ObjectId | string, name: string): Promise<HydratedDocument<Filter>> {
    return FilterModel.findOne({creator: userId, name}).populate(['creator', 'usernames', 'tags']);
  }

  /**
   * Delete all filters associated with given userId
   *
   * @param {string} userId - The relevant userId
   * @returns {Promise<boolean>} - true if the filters have been deleted, false otherwise
   */
  static async deleteAllByUserId(userId: Types.ObjectId | string): Promise<boolean> {
    const filters = await FilterModel.deleteMany({creator: userId});
    return filters !== null;
  }

  /**
   * Remove userId from all filters it appears in.
   *
   * @param {string} userId - The relevant userId
   * @return {Promise<HydratedDocument<Filter>[]>} - An array of updated filters
   */
  static async removeUserIdFromFilters(userId: Types.ObjectId): Promise<Array<HydratedDocument<Filter>>> {
    const promises = [];
    const allFilters = await FilterModel.find({});
    for (const filter of allFilters) {
      const {_id, name, usernames, tags} = filter;
      const index = usernames.indexOf(userId);
      if (index !== -1) {
        usernames.splice(index, 1);
      }

      promises.push(this.updateOne(_id, name, usernames, tags));
    }

    return Promise.all(promises);
  }
}

export default FilterCollection;
