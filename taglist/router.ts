import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import TaglistCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as taglistValidator from './middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get taglist associated with given freetId.
 *
 * @name GET /api/tags/:freetId
 *
 * @return {TaglistResponse} - The taglist of associated with given freetId
 * @throws {404} - If no freet has given freetId
 *
 */
router.get(
  '/:freetId?',
  [
    freetValidator.isFreetExists
  ],
  async (req: Request, res: Response) => {
    const taglist = await TaglistCollection.findOne(req.params.freetId);
    const response = util.constructTaglistResponse(taglist);
    res.status(200).json(response);
  }
);

/**
 * Add taglist to given freetId.
 *
 * @name POST /api/tags/:freetId
 *
 * @param {string} tags - The list of tags to be associated with given freet
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If no freet has given freetId
 * @throws {409} - If the freet already has a list of tags associated with it
 */
router.post(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier,
    taglistValidator.noTaglistExists
  ],
  async (req: Request, res: Response) => {
    const taglist = await TaglistCollection.addOne(req.params.freetId, req.body.tags);

    res.status(200).json({
      message: 'Tags were added to your freet successfully.'
    });
  }
);

/**
 * Delete the taglist associated with a freet
 *
 * @name DELETE /api/tags/:ifreetId
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid or there is no taglist
 *                 associated with that freet
 */
router.delete(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier,
    taglistValidator.isTaglistExists,
  ],
  async (req: Request, res: Response) => {
    await TaglistCollection.deleteOne(req.params.freetId);
    res.status(200).json({
      message: 'Your freet was deleted successfully.'
    });
  }
);

/**
 * Modify the taglist associated with a freet
 *
 * @name PUT /api/tags/:freetId
 *
 * @param {string[]} tags - the new tags to associate with the given freetId
 * @return {TaglistResponse} - the updated taglist of associated with given freetId
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the freet
 * @throws {404} - If the freetId is not valid or there is no taglist
 *                 associated with that freet
 */
router.put(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier,
    taglistValidator.isTaglistExists
  ],
  async (req: Request, res: Response) => {
    const taglist = await TaglistCollection.updateOne(req.params.freetId, req.body.tags);
    res.status(200).json({
      message: 'Your freet was updated successfully.',
      taglist: util.constructTaglistResponse(taglist)
    });
  }
);

export {router as taglistRouter};
