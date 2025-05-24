import * as schema from "@achat/db/schema";
import { hash, verify } from "@node-rs/argon2";
import BizConfig from "@server/config";
import { getTenantInngest } from "@server/queues/inngest";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  apiKey,
  captcha,
  emailOTP,
  openAPI,
  twoFactor,
  username,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import type { Redis } from "ioredis";
import type { TenantDataBase } from "./db";
import type CacheKey from "./db/cache/key";

export const getAuth = async (
  tenantId: string | number,
  db: TenantDataBase,
  cache: Redis,
  cacheKey: CacheKey,
) => {
  const bizConfig = new BizConfig(db, cache, cacheKey);
  const authSecret = await bizConfig.authSecret();

  return betterAuth({
    secret: authSecret,
    // trustedOrigins,
    // account: {
    //   accountLinking: {
    //     enabled: true,
    //     trustedProviders: ["google", "github"],
    //     allowDifferentEmails: true,
    //   },
    // },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secondaryStorage: {
      get: async (key) => {
        return await cache.get(cacheKey.auth(key));
      },
      set: async (key, value, ttl) => {
        if (ttl) await cache.set(cacheKey.auth(key), value, "EX", ttl);
        else await cache.set(cacheKey.auth(key), value);
      },
      delete: async (key) => {
        await cache.del(cacheKey.auth(key));
      },
    },
    plugins: [
      openAPI(),
      username(),
      twoFactor(),
      passkey(),
      admin(),
      apiKey(),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          const inngest = await getTenantInngest(tenantId);
          if (type === "sign-in") {
            // Send the OTP for sign-in
          } else if (type === "email-verification") {
            await inngest.send({
              name: "auth/email.verified",
              data: {
                email,
                otp,
              },
            });
          } else if (type === "forget-password") {
            // Send the OTP for password reset
          }
        },
        otpLength: 6,
        expiresIn: 600,
        sendVerificationOnSignUp: true,
      }),
      // env.CF_TURNSTILE_SECRET_KEY &&
      // 	captcha({
      // 		provider: "cloudflare-turnstile",
      // 		secretKey: env.CF_TURNSTILE_SECRET_KEY,
      // 	}),
    ].filter(Boolean),
    user: {
      additionalFields: {
        referralCode: {
          type: "string",
          required: false,
          defaultValue: null,
          input: true,
        },
        token: {
          type: "string",
          required: false,
          defaultValue: null,
          input: false,
        },
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }) => {
        // Send verification email to user
      },
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
      expiresIn: 10 * 60, // 10 minutes
    },
    emailAndPassword: {
      enabled: true,
      // Not check here, but after signin/signup will check verification status
      // If not verified, will trigger otp verification in server and client will turn to otp verification page
      // requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
      sendResetPassword: async ({ user, url, token }) => {
        // Send reset password email
      },
      resetPasswordTokenExpiresIn: 3600, // 1 hour
      password: {
        hash: async (password) => {
          return await hash(password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
          });
        },
        verify: async ({ hash, password }) => {
          return await await verify(hash, password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
          });
        },
      },
    },
    // socialProviders: {
    // 	github: {
    // 		enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    // 		clientId: env.GITHUB_CLIENT_ID as string,
    // 		clientSecret: env.GITHUB_CLIENT_SECRET as string,
    // 	},
    // 	google: {
    // 		enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    // 		clientId: env.GOOGLE_CLIENT_ID as string,
    // 		clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    // 	},
    // },
  });
};

export type AuthInstance = Awaited<ReturnType<typeof getAuth>>;
export type Session = AuthInstance["$Infer"]["Session"];
