
export const BizCodeEnum = {
  DatabaseError: "DATABASE_ERROR",
  InvalidRequest: "INVALID_REQUEST",

  AuthFailed: "AUTH_FAILED",
  InvalidPassword: "INVALID_PASSWORD",
  InvalidVerificationCode: "INVALID_VERIFICATION_CODE",
  InvalidVerificationToken: "INVALID_VERIFICATION_TOKEN",
  VerifyCodeTooFrequently: "VERIFY_CODE_TOO_FREQUENTLY",
  VerifyCodeSendFailed: "VERIFY_CODE_SEND_FAILED",
  EmailAlreadyUsed: "EMAIL_ALREADY_USED",
  RegisterFailed: "REGISTER_FAILED",

  UserNotFound: "USER_NOT_FOUND",
} as const;

export default class BizError extends Error {
  name = "BizError";

  public readonly code: string;
  public readonly statusCode: number;
  public readonly message: string;

  constructor(code: (typeof BizCodeEnum)[keyof typeof BizCodeEnum]) {
    const [statusCode, message] = BizErrorEnum[code];
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const BizErrorEnum: Record<
  (typeof BizCodeEnum)[keyof typeof BizCodeEnum],
  [statusCode: number, message: string]
> = {
  [BizCodeEnum.DatabaseError]: [500, "Database error"],
  [BizCodeEnum.InvalidRequest]: [400, "Invalid request"],

  [BizCodeEnum.AuthFailed]: [401, "Authentication failed"],
  [BizCodeEnum.InvalidPassword]: [401, "Invalid password"],
  [BizCodeEnum.InvalidVerificationCode]: [401, "Invalid verification code"],
  [BizCodeEnum.InvalidVerificationToken]: [401, "Invalid verification token"],
  [BizCodeEnum.VerifyCodeTooFrequently]: [429, "Verify code too frequently"],
  [BizCodeEnum.VerifyCodeSendFailed]: [500, "Verify code send failed"],
  [BizCodeEnum.EmailAlreadyUsed]: [400, "Email already used"],
  [BizCodeEnum.RegisterFailed]: [400, "Register failed"],
  [BizCodeEnum.UserNotFound]: [404, "User not found"],
} as const;
