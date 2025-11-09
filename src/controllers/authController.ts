import { Request, Response } from 'express';

const login = (req: Request, res: Response) => {
  // Logic to get all users from the database
  res.send('List of all users');
};

export default {
  login,
};
