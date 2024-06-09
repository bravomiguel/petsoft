import 'server-only';

import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { Pet } from '@prisma/client';
import prisma from './db';
import { User } from 'next-auth';

export async function checkAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

export async function getPetById(petId: Pet['id']) {
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  return pet;
}

export async function getPetsByUserId(userId: User['id']) {
  const pets = await prisma.pet.findMany({ where: { userId: userId } });
  return pets;
}

export async function getUserByEmail(email: User["email"]) {
  const user = await prisma.user.findUnique({
    where: {
      email: email ?? undefined,
    }
  });
  return user;
}
