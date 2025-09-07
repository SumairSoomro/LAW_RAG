const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function main() {
    try {
        // Create Supabase client with anon key (not service key for auth)
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
        );

        // Sign in with email/password
        const { data, error } = await supabase.auth.signInWithPassword({
            email: "test3@m.com",
            password: "123"
        });

        if (error) {
            console.error('Authentication error:', error.message);
            return;
        }

        if (!data.session) {
            console.error('No session returned from authentication');
            return;
        }

        const token = data.session.access_token;
        const userId = data.user.id;

        console.log('=== JWT TOKEN ===');
        console.log(token);
        console.log('\n=== USER ID ===');
        console.log(userId);
        console.log('\n=== USER EMAIL ===');
        console.log(data.user.email);

        // Test the token by making a request to verify it works
        console.log('\n=== TOKEN VERIFICATION ===');
        const { data: userData, error: verifyError } = await supabase.auth.getUser(token);
        
        if (verifyError) {
            console.error('Token verification failed:', verifyError.message);
        } else {
            console.log('Token verified successfully for user:', userData.user.email);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };