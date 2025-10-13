"use client"

import { SignInForm } from '@/app/auth/signin/SignInForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthLink } from '@/components/auth/AuthLink';
import { GoogleSignInButton } from '@/components/auth/GoogleSignIn';
import { OrSeparator } from '@/components/auth/OrSeperator';
import { useAuthRedirect } from '@/hooks/auth/useAuthRedirect';

export default function SignInPage() {
	const { loading } = useAuthRedirect()
	if (loading) return null

	return (
		<AuthLayout
			title="Welcome back"
			description="Sign in to your Mifos Assistant account"
		>
			<div className="space-y-4">
				<GoogleSignInButton />
				<OrSeparator text='Or continue with email' />
				<SignInForm />
				<AuthLink href="/auth/signup">
					Don’t have an account? <span className="font-medium">Sign up</span>
				</AuthLink>
				<AuthLink href="/auth/forgot-password">
					Forgot your password?
				</AuthLink>
			</div>
		</AuthLayout>
	)
}