import type {Request, Response, NextFunction} from 'express';
import FilterCollection from './collection';
import UserCollection from '../user/collection';
import type {User} from '../user/model';
import {Types} from 'mongoose';

/**
 * Check that filter name is given and belongs to an existing filter
 */
const isFilterNameExists = async (req: Request, res: Response, next: NextFunction) => {
  if (req.query.usernames !== undefined || req.query.tags !== undefined) {
    next();
    return;
  }

  if (!req.query.name) {
    res.status(400).json({
      error: {
        message: 'Provided filter name must be nonempty.'
      }
    });
    return;
  }

  const filter = await FilterCollection.findOneByUserIdAndName(req.session.userId, req.query.name as string);
  if (!filter) {
    res.status(404).json({
      error: {
        message: `You do not have a filter with name ${req.query.name as string}.`
      }
    });
    return;
  }

  next();
};

/**
 * Check that user does not already have another filter with the same name
 */
const isFilterNameNotAlreadyInUse = async (req: Request, res: Response, next: NextFunction) => {
  if (req.params.filterId !== undefined) { // Update filter
    const currentFilter = await FilterCollection.findOne(req.params.filterId);
    if (req.body.name !== currentFilter.name) {
      const filter = await FilterCollection.findOneByUserIdAndName(req.session.userId, req.body.name);
      if (filter) {
        res.status(409).json({
          error: {
            message: 'This filter name is already in use.'
          }
        });
        return;
      }
    }
  } else if (req.params.filterId === undefined) { // Create new flter
    const filter = await FilterCollection.findOneByUserIdAndName(req.session.userId, req.body.name);
    if (filter) {
      res.status(409).json({
        error: {
          message: 'This filter name is already in use.'
        }
      });
      return;
    }
  }

  next();
};

/**
 * Check that filter name is correctly formatted
 */
const isValidFilterName = async (req: Request, res: Response, next: NextFunction) => {
  const filterRegex = /^\w+$/i;
  if (!filterRegex.test(req.body.name)) {
    res.status(400).json({
      error: {
        message: 'Filter name must be a nonempty alphanumeric string.'
      }
    });
    return;
  }

  next();
};

/**
 * Check that all usernames in a given list are recognized
 */
const isValidUsernameList = async (req: Request, res: Response, next: NextFunction) => {
  let usernames;
  if (req.query.usernames !== undefined) {
    usernames = (req.query.usernames as string) === '' ? [] : (req.query.usernames as string).split(',');
  } else if (req.query.usernames === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    usernames = req.body.usernames;
  }

  const promises = [];
  for (const username of usernames) {
    promises.push(UserCollection.findOneByUsername(username));
  }

  const users: User[] = await Promise.all(promises);
  if (!users.every(u => u !== null)) {
    res.status(404).json({
      error: {
        message: 'Provided usernames must belong to existing users.'
      }
    });
    return;
  }

  next();
};

/**
 * Check that a filter with given id exists
 */
const isFilterExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.filterId);
  const filter = validFormat ? await FilterCollection.findOne(req.params.filterId) : '';
  if (!filter) {
    res.status(404).json({
      error: {
        message: `Filter with id ${req.params.filterId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Check that user is creator of given filter
 */
const isValidFilterModifier = async (req: Request, res: Response, next: NextFunction) => {
  const filter = await FilterCollection.findOne(req.params.filterId);
  if (filter.creator._id.toString() !== req.session.userId) {
    res.status(403).json({
      error: {
        message: 'You cannot modify filters that do not belong to you.'
      }
    });
    return;
  }

  next();
};

/**
 * Check that parameters are valid
 */
const isValidParameters = async (req: Request, res: Response, next: NextFunction) => {
  if (req.query.usernames === undefined || req.query.tags === undefined) {
    res.status(400).json({
      error: {
        message: 'Provided parameters must be nonempty.'
      }
    });
    return;
  }

  next();
};

export {
  isFilterNameExists,
  isFilterNameNotAlreadyInUse,
  isValidFilterName,
  isValidUsernameList,
  isFilterExists,
  isValidFilterModifier,
  isValidParameters
};
