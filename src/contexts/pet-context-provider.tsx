'use client';

import { createContext, useOptimistic, useState } from 'react';

import { addPet, checkoutPet, editPet } from '@/actions/actions';
import { Pet } from '@/lib/types';
import { toast } from 'sonner';

type PetContextProviderProps = {
  data: Pet[];
  children: React.ReactNode;
};

type TPetContext = {
  pets: Pet[];
  selectedPetId: string | null;
  selectedPet: Pet | undefined;
  numberOfPets: number;
  handleChangeSelectedPetId: (id: string) => void;
  handleCheckoutPet: (id: string) => Promise<void>;
  handleAddPet: (newPet: Omit<Pet, 'id'>) => Promise<void>;
  handleEditPet: (id: string, newPet: Omit<Pet, 'id'>) => Promise<void>;
};

export const PetContext = createContext<TPetContext | null>(null);

export default function PetContextProvider({
  data,
  children,
}: PetContextProviderProps) {
  // const [pets, setPets] = useState(data);
  const [optimisticPets, setOptimisticPets] = useOptimistic(data);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const selectedPet = optimisticPets.find((pet) => pet.id === selectedPetId);
  const numberOfPets = optimisticPets.length;

  const handleChangeSelectedPetId = (id: string) => {
    setSelectedPetId(id);
  };

  const handleAddPet = async (newPet: Omit<Pet, 'id'>) => {
    const error = await addPet(newPet);
    if (error) {
      toast.warning(error.message);
      return;
    }
  };

  const handleEditPet = async (petId: string, newPetData: Omit<Pet, 'id'>) => {
    const error = await editPet(petId, newPetData);
    if (error) {
      toast.warning(error.message);
      return;
    }
  };

  const handleCheckoutPet = async (petId: string) => {
    await checkoutPet(petId);
    setSelectedPetId(null);
  };

  return (
    <PetContext.Provider
      value={{
        pets: optimisticPets,
        selectedPetId,
        selectedPet,
        numberOfPets,
        handleAddPet,
        handleChangeSelectedPetId,
        handleCheckoutPet,
        handleEditPet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}
