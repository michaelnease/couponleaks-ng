'use client';

import { Box, Button, Input, VStack, Heading, Field } from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';

import { useForm } from 'react-hook-form';

type SignUpFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
};

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>();

  const onSubmit = (values: SignUpFormValues) => {
    console.log('Form submitted:', values);
    // TODO: wire into Cognito or your API
  };

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={10}
      p={6}
      borderWidth="1px"
      rounded="xl"
      shadow="sm"
    >
      <Heading size="lg" mb={6} textAlign="center">
        Sign Up
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4}>
          <Field.Root invalid={!!errors.firstName} w="full">
            <Field.Label>First Name</Field.Label>
            <Input
              placeholder="John"
              {...register('firstName', { required: 'First name is required' })}
            />
            <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.lastName} w="full">
            <Field.Label>Last Name</Field.Label>
            <Input
              placeholder="Doe"
              {...register('lastName', { required: 'Last name is required' })}
            />
            <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.email} w="full">
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              placeholder="john.doe@couponlover.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: 'Invalid email address',
                },
              })}
            />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.username} w="full">
            <Field.Label>Username</Field.Label>
            <Input
              placeholder="johnthedealhunter"
              {...register('username', { required: 'Username is required' })}
            />
            <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label>Password</Field.Label>
            <PasswordInput {...register('password')} />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>

          <Button
            colorScheme="teal"
            type="submit"
            loading={isSubmitting}
            w="full"
          >
            Sign Up
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
