export type ContinuSketchErrorType =
  | {
      type: "unauthenticated";
      reason: "invalid-authorization-header" | "invalid-jwt" | "user-not-found" | "invalid-session";
    }
  | {
      type: "validation-error";
      errors: string[];
    }
  | {
      type: "unknown";
      error: string;
    };

export const continuSketchError = (type: ContinuSketchErrorType) => {
  return new ContinuSketchError(type);
};

export class ContinuSketchError extends Error {
  constructor(public readonly type: ContinuSketchErrorType) {
    super(`${type.type}`);
  }

  public get httpStatus(): number {
    switch (this.type.type) {
      case "validation-error":
        return 400;
      case "unauthenticated":
        return 401;
      case "unknown":
        return 500;
    }
  }
}
