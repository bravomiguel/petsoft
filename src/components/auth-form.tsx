'use client';

import React from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { logIn, signUp } from '@/actions/actions';
import AuthFormBtn from './auth-form-btn';
import { useFormState } from 'react-dom';

type AuthFormProps = {
  type: 'logIn' | 'signUp';
};

function AuthForm({ type }: AuthFormProps) {
  const [signUpError, dispatchSignUp] = useFormState(signUp, undefined);
  const [logInError, dispatchLogIn] = useFormState(logIn, undefined);
  return (
    <form action={type === 'logIn' ? dispatchLogIn : dispatchSignUp}>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required maxLength={100} />
      </div>
      <div className="space-y-1 mt-2 mb-4">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          maxLength={100}
        />
      </div>
      <AuthFormBtn type={type} />
      {signUpError && (
        <p className="text-500-red text-sm mt-2">{signUpError.message}</p>
      )}
      {logInError && (
        <p className="text-500-red text-sm mt-2">{logInError.message}</p>
      )}
    </form>
  );
}

export default AuthForm;
