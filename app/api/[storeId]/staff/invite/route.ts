import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { getUserPermissions } from "@/lib/rbac-middleware";
import { Permissions } from "@/hooks/use-rbac";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is store owner
    const isStoreOwner = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    // If not store owner, check for MANAGE_ROLES permission
    if (!isStoreOwner) {
      const hasPermission = await getUserPermissions(session.userId, params.storeId);
      if (!hasPermission.includes(Permissions.MANAGE_ROLES)) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const body = await req.json();
    const { email, roleId } = body;

    if (!email || !roleId) {
      return new NextResponse("Email and role are required", { status: 400 });
    }

    // Check if user is already a staff member
    const existingUser = await prismadb.user.findFirst({
      where: {
        email,
        roleAssignments: {
          some: {
            storeId: params.storeId
          }
        }
      }
    });

    if (existingUser) {
      return new NextResponse("User is already a staff member", { status: 400 });
    }

    // Check if there's a pending invitation
    const existingInvitation = await prismadb.staffInvitation.findFirst({
      where: {
        email,
        storeId: params.storeId,
        status: 'pending'
      }
    });

    if (existingInvitation) {
      return new NextResponse("Invitation already sent to this email", { status: 400 });
    }

    // Generate invitation token and expiry date
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    // Create staff invitation
    const invitation = await prismadb.staffInvitation.create({
      data: {
        email,
        storeId: params.storeId,
        roleId,
        token,
        status: 'pending',
        expiresAt,
      }
    });

    // Get store info for email
    const store = await prismadb.store.findUnique({
      where: { id: params.storeId },
      select: { name: true }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    // Check required environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || 
        !process.env.SMTP_USER || !process.env.SMTP_PASS || 
        !process.env.SMTP_FROM) {
      console.error('Missing email configuration');
      return new NextResponse("Email service not configured", { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('Missing NEXT_PUBLIC_APP_URL');
      return new NextResponse("Application URL not configured", { status: 500 });
    }

    // Create join URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''); // Remove trailing slash if present
    const joinUrl = `${baseUrl}/${params.storeId}/staff/join?token=${token}`;

    // Send invitation email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Invitation to join ${store.name} staff`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Staff Invitation from ${store.name}</h1>
            <p>Hello,</p>
            <p>You've been invited to join the staff team at ${store.name}. To accept this invitation and set up your account, please click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${joinUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This invitation will expire in 24 hours. If you did not expect this invitation, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this URL into your browser:</p>
            <p style="color: #666; font-size: 12px; word-break: break-all;">${joinUrl}</p>
          </body>
        </html>
      `,
    });

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('[STAFF_INVITE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
