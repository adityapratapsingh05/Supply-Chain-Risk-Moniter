import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import { sendEmail, verificationEmailHtml, resetPasswordEmailHtml } from '../utils/email';
import { AuthedRequest } from '../middleware/auth';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function setAuthCookie(res: Response, token: string, remember: boolean) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
}

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      emailVerifyToken,
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      role: 'VIEWER',
    },
  });

  const link = `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`;
  await sendEmail(email, 'Verify your email', verificationEmailHtml(name, link));

  await prisma.auditLog.create({
    data: { userId: user.id, action: 'SIGNUP', entity: 'User', entityId: user.id },
  });

  res.status(201).json({ message: 'Account created. Check your email to verify your account.' });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.body;
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token, emailVerifyExpires: { gt: new Date() } },
  });
  if (!user) return res.status(400).json({ error: 'Invalid or expired verification link.' });

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
  });
  res.json({ message: 'Email verified. You can now log in.' });
}

export async function login(req: Request, res: Response) {
  const { email, password, rememberMe } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });
  if (!user.isActive) return res.status(403).json({ error: 'This account has been disabled.' });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
  setAuthCookie(res, accessToken, !!rememberMe);

  await prisma.auditLog.create({ data: { userId: user.id, action: 'LOGIN' } });

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
  });
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'Logged out.' });
}

export async function me(req: AuthedRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    avatarUrl: user.avatarUrl, isEmailVerified: user.isEmailVerified, createdAt: user.createdAt,
  });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond success to avoid leaking which emails exist
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: resetToken, resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000) },
  });
  const link = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail(email, 'Reset your password', resetPasswordEmailHtml(user.name, link));
  res.json({ message: 'If that email exists, a reset link has been sent.' });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() } },
  });
  if (!user) return res.status(400).json({ error: 'Invalid or expired reset link.' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetPasswordToken: null, resetPasswordExpires: null },
  });
  res.json({ message: 'Password reset. You can now log in.' });
}

export async function googleAuth(req: Request, res: Response) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken is required.' });

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) return res.status(400).json({ error: 'Invalid Google token.' });

  let user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        googleId: payload.sub,
        avatarUrl: payload.picture,
        isEmailVerified: true,
        role: 'VIEWER',
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub } });
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  setAuthCookie(res, accessToken, true);
  res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
