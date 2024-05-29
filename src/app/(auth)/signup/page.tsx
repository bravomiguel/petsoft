import AuthForm from '@/components/auth-form';
import H1 from '@/components/h1';
import Link from 'next/link';

const Page = () => {
  return (
    <main>
      <H1 className="text-center mb-5">Sign Up</H1>
      <AuthForm />
      <p className="mt-6 text-zinc-500 text-sm">
        Already have an account?{' '}
        <Link href={'/login'} className="font-medium">
          Log in
        </Link>
      </p>
    </main>
  );
};

export default Page;
