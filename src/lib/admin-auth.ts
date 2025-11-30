import React from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/admin';

export interface WithAdminAuthProps {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export function withAdminAuth(
  requiredRoles: UserRole[] = ['manager', 'owner']
) {
  return async function ({ req, res }: GetServerSidePropsContext) {
    try {
      // Get the user from the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        return {
          redirect: {
            destination: '/auth/signin?message=You must be signed in to access this page',
            permanent: false,
          },
        };
      }

      // Get the user's profile with role
      const { data: profile, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        return {
          redirect: {
            destination: '/auth/signin?message=User profile not found',
            permanent: false,
          },
        };
      }

      // Check if user has required role
      if (!requiredRoles.includes((profile as any).role as UserRole)) {
        return {
          redirect: {
            destination: '/?message=You do not have permission to access this page',
            permanent: false,
          },
        };
      }

      return {
        props: {
          user: {
            id: session.user.id,
            email: session.user.email!,
            role: (profile as any).role as UserRole,
          },
        },
      };
    } catch (error) {
      console.error('Admin auth error:', error);
      return {
        redirect: {
          destination: '/auth/signin?message=Authentication error',
          permanent: false,
        },
      };
    }
  };
}

export function withOwnerAuth() {
  return withAdminAuth(['owner']);
}

// Client-side auth hook
export function useAdminAuth() {
  const [user, setUser] = React.useState<WithAdminAuthProps['user'] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile && (profile as any).role && ['manager', 'owner'].includes((profile as any).role as UserRole)) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: (profile as any).role as UserRole,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading admin user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          return;
        }

        if (session) {
          try {
            const { data: profile } = await (supabase
              .from('profiles') as any)
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (profile && (profile as any).role && ['manager', 'owner'].includes((profile as any).role as UserRole)) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                role: (profile as any).role as UserRole,
              });
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error('Error handling auth change:', error);
            setUser(null);
          }
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}