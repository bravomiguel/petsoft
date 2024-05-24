'use server';

import { revalidatePath } from 'next/cache';

import prisma from '@/lib/db';
import { sleep } from '@/lib/utils';
import { PetEssentials } from '@/lib/types';
import { Pet } from '@prisma/client';

export async function addPet(pet: PetEssentials) {
  await sleep(1000);

  try {
    await prisma.pet.create({
      data: pet,
    });
  } catch (error) {
    return {
      message: 'Could not add pet.',
    };
  }

  revalidatePath('/app', 'layout');
}

export async function editPet(petId: Pet['id'], newPetData: PetEssentials) {
  await sleep(1000);

  try {
    await prisma.pet.update({
      where: {
        id: petId,
      },
      data: newPetData,
    });
  } catch (error) {
    return {
      message: 'Could not edit pet.',
    };
  }

  revalidatePath('/app', 'layout');
}

export async function checkoutPet(petId: Pet['id']) {
  await sleep(1000);

  try {
    await prisma.pet.delete({
      where: {
        id: petId,
      },
    });
  } catch (error) {
    return {
      message: 'Could not delete pet.',
    };
  }

  revalidatePath('/app', 'layout');
}
