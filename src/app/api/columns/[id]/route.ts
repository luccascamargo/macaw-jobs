
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  await prisma.column.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Column deleted" });
}
