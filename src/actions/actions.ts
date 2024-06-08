'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/db';
import { sleep } from '@/lib/utils';
import { petFormSchema, petIdSchema } from '@/lib/validations';
import { auth, signIn, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { checkAuth } from '@/lib/server-utils';

// --- user actions ---

export async function signUp(formData: FormData) {
  const hashedPassword = await bcrypt.hash(
    formData.get('password') as string,
    10,
  );

  await prisma.user.create({
    data: {
      email: formData.get('email') as string,
      hashedPassword,
    },
  });

  await signIn('credentials', formData);
}

export async function logIn(formData: FormData) {
  await signIn('credentials', formData);
}

export async function logOut() {
  await signOut({ redirectTo: '/' });
}

// --- pet actions ---

export async function addPet(pet: unknown) {
  await sleep(1000);
  const session = await checkAuth();

  const validatedPet = petFormSchema.safeParse(pet);
  if (!validatedPet.success) {
    return {
      message: 'Invalid pet data.',
    };
  }

  try {
    await prisma.pet.create({
      data: {
        ...validatedPet.data,
        user: {
          connect: {
            id: session.user?.id,
          },
        },
      },
    });
  } catch (error) {
    return {
      message: 'Could not add pet.',
    };
  }

  revalidatePath('/app', 'layout');
}

export async function editPet(petId: unknown, newPetData: unknown) {
  await sleep(1000);
  // authentication check
  const session = await checkAuth();

  // validation check
  const validatedPetId = petIdSchema.safeParse(petId);
  const validatedPet = petFormSchema.safeParse(newPetData);

  if (!validatedPetId.success || !validatedPet.success) {
    return {
      message: 'Invalid pet data.',
    };
  }

  // authorization check (user owns pet)
  const pet = await prisma.pet.findUnique({ where: { id: validatedPetId.data } });

  if (!pet) {
    return {
      message: "pet not found",
    }
  }
  if (pet.userId !== session.user.id) {
    return {
      message: "Not authorized",
    }
  }

  // database mutation
  try {
    await prisma.pet.update({
      where: {
        id: validatedPetId.data,
      },
      data: validatedPet.data,
    });
  } catch (error) {
    return {
      message: 'Could not edit pet.',
    };
  }

  revalidatePath('/app', 'layout');
}

export async function checkoutPet(petId: unknown) {
  await sleep(1000);
  // authentication check
  const session = await checkAuth();

  // validation check
  const validatedPetId = petIdSchema.safeParse(petId);

  if (!validatedPetId.success) {
    return {
      message: 'Invalid pet data.',
    };
  }

  // authorization check (user owns pet)
  const pet = await prisma.pet.findUnique({ where: { id: validatedPetId.data } });

  if (!pet) {
    return {
      message: "pet not found",
    }
  }
  if (pet.userId !== session.user.id) {
    return {
      message: "Not authorized",
    }
  }

  // database mutation
  try {
    await prisma.pet.delete({
      where: {
        id: validatedPetId.data,
      },
    });
  } catch (error) {
    return {
      message: 'Could not delete pet.',
    };
  }

  revalidatePath('/app', 'layout');
}
