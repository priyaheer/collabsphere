import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9_.-]+$/, "Username may only contain letters, numbers, dots, dashes and underscores"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date },
    emailVerificationSentAt: { type: Date },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date },
    passwordChangedAt: { type: Date },
    loginFailedAttempts: { type: Number, default: 0, select: false },
    loginLockedUntil: { type: Date, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    skills: { type: [String], default: [] },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.emailVerificationTokenHash;
        delete ret.passwordResetTokenHash;
        delete ret.emailVerificationExpiresAt;
        delete ret.emailVerificationSentAt;
        delete ret.passwordResetExpiresAt;
        delete ret.loginFailedAttempts;
        delete ret.loginLockedUntil;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Fields safe to expose about *other* users (member lists, public pages).
export const PUBLIC_USER_FIELDS = "name username avatar bio skills";

export default mongoose.model("User", userSchema);
