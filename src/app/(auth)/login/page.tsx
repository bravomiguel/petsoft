import AuthForm from '@/components/auth-form';
import H1 from '@/components/h1';
import Link from 'next/link';

const Page = () => {
  return (
    <main>
      <H1 className="text-center mb-5">Log In</H1>
      <AuthForm />
      <p className='mt-6 text-zinc-500 text-sm'>
        No account yet?{' '}
        <Link href={'/signup'} className="text-sm font-medium">
          Sign up
        </Link>
      </p>
    </main>
  );
};

export default Page;
