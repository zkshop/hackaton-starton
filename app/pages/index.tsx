import {
  Center,
  Heading,
  Box,
  Button,
  useToast,
  HStack,
  VStack,
  Text,
  Link,
} from "@chakra-ui/react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CONTRACT_BUILDER_SCHEMA, FormInput, FormValues } from "../form";
import { LocalApiService } from "../http";
import { useState } from "react";
import { abi } from "../contract";

const Local = LocalApiService();

export default function Home() {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const methods = useForm<FormValues>({
    resolver: yupResolver(CONTRACT_BUILDER_SCHEMA),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    formState: {},
  } = methods;

  const handleClickCopyABI = () => {
    navigator.clipboard.writeText(JSON.stringify(abi));
    setCopied(true);
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await Local.sendContractBuilderForm(values);
      toast({
        position: "top",
        status: "success",
        title: "NFT Collection Deployed",
        description: `${values.collectionName} have been deployed with Starton. Check your Starton dashboard for more information`,
      });
    } catch (e) {
      console.log(e);
      toast({
        position: "top",
        status: "error",
        title: "An error occured",
        description: `Please try again later.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center display="flex" flexDirection="column" h="100vh">
      <Box textAlign="center" mb={10}>
        <Heading color="primary" as="h1">
          Ch3ck0ut
        </Heading>
        <Text fontWeight="bold" color="secondary">
          A layer on top of Starton to use other 3rd party softwares powered by{" "}
          <Link isExternal href="https://www.3shop.co">
            3shop
          </Link>
        </Text>
      </Box>

      <Box
        width="600px"
        p={2}
        border="3px solid"
        borderColor="primary"
        border-radius="10px"
        overflow="scroll"
        mb={10}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            <Heading color="primary" textAlign="center" fontSize="lg">
              Contract Builder
            </Heading>

            <HStack justifyContent="space-around" my={2}>
              <VStack>
                <FormInput
                  name="collectionName"
                  type="string"
                  label="Collection Name"
                />
                <FormInput name="symbol" type="string" label="Symbol" />
                <FormInput name="ipfsURI" type="string" label="Ipfs URI" />
                <FormInput name="maxSupply" type="number" label="Max Supply" />
              </VStack>
              <VStack>
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
              </VStack>
            </HStack>

            <Box py={2} display="flex" justifyContent="flex-end">
              <Button
                bg="primary"
                color="white"
                mr={2}
                onClick={handleClickCopyABI}
                type="button"
              >
                {copied ? "Copied!" : "Copy ABI"}
              </Button>

              <Button
                bg="primary"
                color="white"
                type="submit"
                isLoading={loading}
                isDisabled={loading}
              >
                Deploy
              </Button>
            </Box>
          </FormProvider>
        </form>
      </Box>
      <Text fontWeight="bold">
        Any question ?{" "}
        <Link href="mailto:contact@3shop.co">contact@3shop.co</Link>
      </Text>
    </Center>
  );
}
