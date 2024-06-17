'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/db';
import { sleep } from '@/lib/utils';
import { authSchema, petFormSchema, petIdSchema } from '@/lib/validations';
import { signIn, signOut } from '@/lib/auth-no-edge';
import { checkAuth, getPetById } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { AuthError } from 'next-auth';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// --- user actions ---

export async function signUp(prevState: unknown, formData: unknown) {
  if (!(formData instanceof FormData)) {
    return {
      message: 'Invalid form data',
    };
  }
  const formDataEntries = Object.fromEntries(formData.entries());

  const validatedFormData = authSchema.safeParse(formDataEntries);

  if (!validatedFormData.success) {
    return {
      message: 'Invalid form data',
    };
  }

  const { email, password } = validatedFormData.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email: email,
        hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          message: 'Email already exists.',
        };
      }
    }
  }

  await signIn('credentials', formData);

  redirect('/app/dashboard');
}

export async function logIn(prevState: unknown, formData: unknown) {
  if (!(formData instanceof FormData)) {
    return {
      message: 'Invalid form data',
    };
  }

  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin': {
          return {
            message: 'Invalid credentials',
          };
        }
        default: {
          return {
            message: 'Error, could not sign in',
          };
        }
      }
    }
    throw error; // to deal with next.js redirect throwing error
  }
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
  const pet = await getPetById(validatedPetId.data);

  if (!pet) {
    return {
      message: 'pet not found',
    };
  }
  if (pet.userId !== session.user.id) {
    return {
      message: 'Not authorized',
    };
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
  const pet = await getPetById(validatedPetId.data);

  if (!pet) {
    return {
      message: 'pet not found',
    };
  }
  if (pet.userId !== session.user.id) {
    return {
      message: 'Not authorized',
    };
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

// --- payment actions ---

export async function createCheckoutSession() {
  // authentication check
  const session = await checkAuth();

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: 'price_1PPd4YJ3xraViwhhwLhhwFo1',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.CANONICAL_URL}/payment?success=true`,
    cancel_url: `${process.env.CANONICAL_URL}/payment?cancelled=true`,
  });

  // redirect user
  redirect(checkoutSession.url);
}
