import { Request, Response } from 'express';

const getAllUsers = (req: Request, res: Response) => {
  // Logic to get all users from the database
  res.send('List of all users');
};

export default {
  getAllUsers,
};
