import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { name, email, password, lastname } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nome, e-mail e senha são obrigatórios." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "E-mail já cadastrado." },
      { status: 409 }
    );
  }

  let username = `${name}${lastname}`;

  const existingUserWithUsername = await prisma.user.findFirst({
    where: {
      username: username.toLocaleLowerCase(),
    },
  });

  if (existingUserWithUsername) {
    username = username + Math.floor(Math.random() * 1001);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      lastname,
      avatar: "",
      username,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
