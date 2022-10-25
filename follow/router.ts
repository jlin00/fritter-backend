import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FollowCollection from './collection';
import UserCollection from '../user/collection';
import TagCollection from '../tag/collection';
import * as followValidator from './middleware';
import * as userValidator from '../user/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get following list.
 *
 * @name GET /api/follow?followingOf=username
 *
 * @return {FollowResponse[]} - Following list of given user
 * @throws {400} - If username is not given
 * @throws {404} - If no user has given username
 *
 */
/**
 * Get followers list.
 *
 * @name GET /api/follow?followersOf=username
 *
 * @return {FollowResponse[]} - Followers list of given user
 * @throws {400} - If username is not given
 * @throws {404} - If no user has given username
 *
 */
router.get(
  '/',
  [
    followValidator.isValidQuery,
    followValidator.isValidUsername
  ],
  async (req: Request, res: Response) => {
    let follows;
    if (req.query.followingOf !== undefined) {
      const user = await UserCollection.findOneByUsername(req.query.followingOf as string);
      follows = await FollowCollection.findAllByFollowerId(user._id);
    } else if (req.query.followersOf !== undefined) {
      const user = await UserCollection.findOneByUsername(req.query.followersOf as string);
      follows = await FollowCollection.findAllByFollowingId(user._id);
    }

    const response = follows.map(util.constructFollowResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new follow.
 *
 * @name POST /api/follow
 *
 * @param {string} source - The name of the source to follow
 * @param {string} type - The type of the source
 * @return {FollowResponse} - The created follow
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the source or type is invalid
 * @throws {409} - If the source is already in the user's following list
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    followValidator.isValidType,
    followValidator.isNotSelf,
    followValidator.isValidUsername,
    followValidator.isNotInFollowing
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const source = req.body.type === 'User' ? await UserCollection.findOneByUsername(req.body.source) : await TagCollection.findOrCreateOne(req.body.source);
    const follow = await FollowCollection.addOne(userId, source._id, req.body.type);

    res.status(201).json({
      message: 'Your follow was created successfully.',
      follow: util.constructFollowResponse(follow)
    });
  }
);

/**
 * Delete a follow
 *
 * @name DELETE /api/follow/:followId
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the owner of the
 *                 follow object
 * @throws {404} - If the followId is not valid
 */
router.delete(
  '/:followId?',
  [
    userValidator.isUserLoggedIn,
    followValidator.isFollowExists,
    followValidator.isValidFollowModifier
  ],
  async (req: Request, res: Response) => {
    await FollowCollection.deleteOne(req.params.followId);
    res.status(200).json({
      message: 'Your follow was deleted successfully.'
    });
  }
);

export {router as followRouter};
