import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { prisma } from './database';

// Configure local strategy
export const configurePassport = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // Use email as username field
        passwordField: 'password',
      },
      async (email, password, done) => {
        console.log('Authenticating user:', email);
        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Return user without password, mapped to Express.User interface
          const mappedUser: Express.User = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            position: user.position,
            image_url: user.image_url,
            phone: user.phone,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
          return done(null, mappedUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: Express.User, done: (err: any, id?: string) => void) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done: (err: any, user?: Express.User | null) => void) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          fullName: true,
          position: true,
          image_url: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (user) {
        // Map the user data to match our Express.User interface
        const mappedUser: Express.User = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          position: user.position,
          image_url: user.image_url,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
        done(null, mappedUser);
      } else {
        done(null, null);
      }
    } catch (error) {
      console.error('Error during deserialization:', error);
      done(error);
    }
  });
}