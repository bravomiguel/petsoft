import React from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { logIn } from '@/actions/actions';

type AuthFormProps = {
  type: 'logIn' | 'signUp';
};

function AuthForm({ type }: AuthFormProps) {
  return (
    <form action={logIn}>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" />
      </div>
      <div className="space-y-1 mt-2 mb-4">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" />
      </div>
      <Button>{type === "logIn" ? "Log In" : "Sign Up"}</Button>
    </form>
  );
}

export default AuthForm;
