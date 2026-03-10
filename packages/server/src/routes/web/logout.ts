import { Request, Response } from "express";

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    }

    res.clearCookie("session", {
      httpOnly: true,
      secure: false,
      sameSite: false
    });

    res.sendStatus(204);
  });
}
