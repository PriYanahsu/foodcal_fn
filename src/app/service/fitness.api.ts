import axiosInstance from '@/lib/springboot/axios';
import { FitnessDetails } from '@/features/userProfile/type';
import { EMPTY_FITNESS_DETAILS } from '@/features/userProfile/utils/Constants';

export const getFitness = async (): Promise<FitnessDetails> => {
  const { data } = await axiosInstance.get<FitnessDetails>(`/v1/fitness/get`);
  return { ...EMPTY_FITNESS_DETAILS, ...data };
};

export const updateFitness = async (
  fitness: FitnessDetails
): Promise<{ data: FitnessDetails; status: number }> => {
  const { data, status } = await axiosInstance.put<FitnessDetails>(`/v1/fitness/update`, fitness);
  return {
    data: data ? { ...EMPTY_FITNESS_DETAILS, ...data } : { ...fitness },
    status,
  };
};
