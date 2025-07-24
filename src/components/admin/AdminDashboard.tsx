--- a/src/components/admin/AdminDashboard.tsx
+++ b/src/components/admin/AdminDashboard.tsx
@@ -35,7 +35,7 @@
         // Fetch user stats
         const { data: users, error: usersError } = await supabase
           .from('users')
-          .select('id, subscription_status, created_at')
+          .select('id, subscription_status, created_at, subscription_course_credits_used') // Select new column
           .order('created_at', { ascending: false });
           
         if (usersError) throw usersError;
@@ -60,7 +60,7 @@
         
         // Calculate stats
         const now = new Date();
-        const activeUsers = users.filter(u => u.subscription_status === 'active' || u.subscription_status === 'trial').length;
+        const activeUsers = users.filter(u => u.subscription_status === 'active' || u.subscription_status === 'trial').length; // Still count active users based on subscription status
         const upcomingEvents = events.filter(e => new Date(e.date) > now).length;
         
         // Calculate monthly revenue (simplified)
@@ -85,7 +85,7 @@
           totalUsers: users.length,
           activeUsers,
           totalEvents: events.length,
           upcomingEvents,
           monthlyRevenue,
           growthRate
         });
         
@@ -93,7 +93,7 @@
         const recentRegistrations = await supabase
           .from('registrations')
           .select('*, users(name)')
-          .order('registered_at', { ascending: false })
+          .order('registered_at', { ascending: false }) // Keep for event registrations
           .limit(5);
           
         const recentSubscriptions = await supabase