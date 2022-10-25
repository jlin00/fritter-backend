import type {HydratedDocument, Types} from 'mongoose';
import type {Tag} from 'tag/model';
import TagModel from './model';

/**
 * This files contains a class that has the functionality to explore tags
 * stored in MongoDB, including getting and creating tags.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Tag> is the output of the TagModel() constructor,
 * and contains all the information in Tag. https://mongoosejs.com/docs/typescript.html
 */
class TagCollection {
  /**
   * Get or create a tag object given its name.
   *
   * @param {string} name - The name of the tag
   * @return {Promise<HydratedDocument<Tag>> | Promise<null> } - The tag object
   */
  static async findOrCreateOne(name: string): Promise<HydratedDocument<Tag>> {
    const tag = await TagModel.findOne({tag: name});

    if (!tag) {
      const tag = new TagModel({
        tag: name
      });
      await tag.save();
    }

    return tag;
  }
}

export default TagCollection;