import type {HydratedDocument, Types} from 'mongoose';
import type {Follow} from './model';
import FollowModel from './model';

/**
 * This files contains a class that has the functionality to explore follows
 * stored in MongoDB, including adding, finding, updating, and deleting follows.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Follow> is the output of the FollowModel() constructor,
 * and contains all the information in Follow. https://mongoosejs.com/docs/typescript.html
 */
class FollowCollection {
  /**
   * Add a follow to the collection
   *
   * @param {string} followerId - The id of the follower
   * @param {string} followingId - The id of the source to be followed
   * @return {Promise<HydratedDocument<Follow>>} - The newly created follow
   */
  static async addOne(followerId: Types.ObjectId | string, followingId: Types.ObjectId | string, sourceModel: string): Promise<HydratedDocument<Follow>> {
    const follow = new FollowModel({
      follower: followerId,
      following: followingId,
      sourceModel
    });
    await follow.save(); // Saves follow to MongoDB
    return follow.populate(['follower', 'following']);
  }

  /**
   * Find a follow by followId
   *
   * @param {string} followId - The id of the follow to find
   * @return {Promise<HydratedDocument<Follow>> | Promise<null> } - The follow with the given followId, if any
   */
  static async findOne(followId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
    return FollowModel.findOne({_id: followId}).populate(['follower', 'following']);
  }

  /**
   * Get all the follows where the follower is a given user id
   *
   * @param {string} id - The follower id
   * @return {Promise<HydratedDocument<Follow>[]>} - An array of all of the follows
   */
  static async findAllByFollowerId(id: Types.ObjectId | string): Promise<Array<HydratedDocument<Follow>>> {
    return FollowModel.find({follower: id}).populate(['following', 'follower']);
  }

  /**
   * Get all the follows where the source being followed is a given id
   *
   * @param {string} id - The following id
   * @return {Promise<HydratedDocument<Follow>[]>} - An array of all of the follows
   */
  static async findAllByFollowingId(id: Types.ObjectId | string): Promise<Array<HydratedDocument<Follow>>> {
    return FollowModel.find({following: id}).populate(['following', 'follower']);
  }

  /**
   * Get all the follows with given followerId and followingId
   *
   * @param {string} followerId - The follower id
   * * @param {string} followingId - The following id
   * @return {Promise<HydratedDocument<Follow>[]>} - The matching follow object
   */
  static async findOneByIds(followerId: Types.ObjectId | string, followingId: Types.ObjectId | string): Promise<Array<HydratedDocument<Follow>>> {
    return FollowModel.findOne({follower: followerId, following: followingId}).populate(['following', 'follower']);
  }

  /**
   * Delete a follow with given followId.
   *
   * @param {string} followId - The followId of follow to delete
   * @return {Promise<Boolean>} - true if the follow has been deleted, false otherwise
   */
  static async deleteOne(followId: Types.ObjectId | string): Promise<boolean> {
    const follow = await FollowModel.deleteOne({_id: followId});
    return follow !== null;
  }
}

export default FollowCollection;
