import { sign, verify, VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  verify(
    token,
    process.env.JWT_SECRET_KEY as string,
    (err: VerifyErrors | null) => {
      console.log(err);

      if (err) return res.sendStatus(403);

      next();
    },
  );
};

export const generateAccessToken = (sessionName: string) => {
  return sign(sessionName, process.env.JWT_SECRET_KEY as string);
};
