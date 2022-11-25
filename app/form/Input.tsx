import { useFormContext } from "react-hook-form";
import { FormValues } from ".";
import {
  Input as OriginalInput,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";

type InputProps = {
  type?: "string" | "number";
  name: keyof FormValues;
};

export const Input = ({ type = "string", name }: InputProps) => {
  const { register } = useFormContext<FormValues>();

  if (type === "number") {
    return (
      <NumberInput min={0}>
        <NumberInputField {...register(name)} />
      </NumberInput>
    );
  }

  return <OriginalInput {...register(name)} />;
};
