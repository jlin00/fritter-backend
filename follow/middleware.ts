import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FollowCollection from './collection';
import UserCollection from '../user/collection';
import TagCollection from '../tag/collection';

/**
 * Check that given type is valid
 */
const isValidType = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.type !== 'User' && req.body.type !== 'Tag') {
    res.status(404).json({
      error: {
        message: 'Source type must be either User or Tag.'
      }
    });
    return;
  }

  next();
};

/**
 * Check that the querystring is valid
 */
const isValidQuery = async (req: Request, res: Response, next: NextFunction) => {
  // Check if followingOf or followersOf query parameter was supplied
  if ((req.query.followingOf === undefined && req.query.followersOf === undefined)
      || (req.query.followingOf !== undefined && req.query.followersOf !== undefined)
      || req.query.followingOf === ''
      || req.query.followersOf === '') {
    res.status(400).json({
      error: {
        message: 'Either followingOf or followersOf should be provided!'
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a follow with followId exists
 */
const isFollowExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.followId);
  const follow = validFormat ? await FollowCollection.findOne(req.params.followId) : '';
  if (!follow) {
    res.status(404).json({
      error: {
        message: `Follow with follow ID ${req.params.followId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is the owner of the follow object
 */
const isValidFollowModifier = async (req: Request, res: Response, next: NextFunction) => {
  const follow = await FollowCollection.findOne(req.params.followId);
  if (req.session.userId !== follow.follower._id.toString()) {
    res.status(403).json({
      error: {
        message: 'Cannot delete sources from other users\' following list.'
      }
    });
    return;
  }

  next();
};

/**
 * Checks that a given id is valid
 */
const isValidUsername = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.type === undefined || req.body.type === 'User') {
    const username = (req.query.followingOf as string) ?? (req.query.followersOf as string) ?? (req.body.source as string) ?? '';
    const user = await UserCollection.findOneByUsername(username);

    if (!user) {
      res.status(404).json({
        error: {
          message: `Given username ${username} does not exist.`
        }
      });
      return;
    }
  }

  next();
};

/**
 * Check that a source is not already in a user's following list
 */
const isNotInFollowing = async (req: Request, res: Response, next: NextFunction) => {
  const source = req.body.type === 'User' ? await UserCollection.findOneByUsername(req.body.source) : await TagCollection.findOrCreateOne(req.body.source);
  const follow = await FollowCollection.findOneByIds(req.session.userId, source._id);
  if (follow) {
    res.status(409).json({
      error: {
        message: 'You already followed this source.'
      }
    });
    return;
  }

  next();
};

/**
 * Check that user is not following themself
 */
const isNotSelf = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.type === 'User') {
    const user = await UserCollection.findOneByUsername(req.body.source);
    if (user._id === req.session.userId) {
      res.status(409).json({
        error: {
          message: 'You cannot follow yourself.'
        }
      });
      return;
    }
  }

  next();
};

export {
  isFollowExists,
  isValidFollowModifier,
  isValidUsername,
  isNotInFollowing,
  isNotSelf,
  isValidQuery,
  isValidType
};
