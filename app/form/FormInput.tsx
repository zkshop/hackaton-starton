import { FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { FormValues, Input } from ".";

type FormInputProps = {
  label: string;
  name: keyof FormValues;
  type?: "string" | "number";
};

export const FormInput = ({ label, type, name }: FormInputProps) => {
  const {
    formState: { errors },
  } = useFormContext<FormValues>();
  return (
    <FormControl isInvalid={Boolean(errors[name])} my={3}>
      <FormLabel color="secondary">{label}</FormLabel>
      <Input name={name} type={type} />
      <FormErrorMessage>{errors[name]?.message}</FormErrorMessage>
    </FormControl>
  );
};
