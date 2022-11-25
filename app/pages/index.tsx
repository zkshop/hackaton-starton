import { Center, Heading, Box, Button } from "@chakra-ui/react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CONTRACT_BUILDER_SCHEMA, FormInput, FormValues } from "./form";
import { LocalApiService } from "./http";
import { useState } from "react";

const Local = LocalApiService();

export default function Home() {
  const methods = useForm<FormValues>({
    resolver: yupResolver(CONTRACT_BUILDER_SCHEMA),
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await Local.sendContractBuilderForm(values);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="100vh">
      <Box width="400px" p={2} border="3px solid #939A98" border-radius="10px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            <Heading textAlign="left" fontSize="lg">
              Contract Builder
            </Heading>

            <Box my={2}>
              <FormInput
                name="collectionName"
                type="string"
                label="Collection Name"
              />
              <FormInput name="symbol" type="string" label="Symbol" />
              <FormInput name="ipfsURI" type="string" label="Ipfs URI" />
              <FormInput name="maxSupply" type="number" label="Max Supply" />
              <FormInput
                name="ownerAddress"
                type="string"
                label="Owner Address"
              />
              <FormInput
                name="startonApiKey"
                type="string"
                label="Starton Api Key"
              />
              <FormInput
                name="startonKms"
                type="string"
                label="Starton KMS"
              />
              <FormInput name="price" type="number" label="Mint price" />
            </Box>

            <Box py={2} display="flex" justifyContent="flex-end">
              <Button type="submit" isLoading={loading} isDisabled={loading}>
                Deploy
              </Button>
            </Box>
          </FormProvider>
        </form>
      </Box>
    </Center>
  );
}
