export async function createGoogleMeetEvent(eventDetails: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
}) {
  try {
    console.log("Creating Google Meet event:", eventDetails);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      throw new Error('Supabase configuration is missing');
    }

    // Format dates as ISO strings
    const formattedDetails = {
      ...eventDetails,
      startTime: eventDetails.startTime.toISOString(),
      endTime: eventDetails.endTime.toISOString()
    };

    console.log("Calling Supabase function with data:", formattedDetails);
    const response = await fetch(`${supabaseUrl}/functions/v1/create-google-meet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedDetails),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Meet API error (${response.status}):`, errorText);
      throw new Error(`Failed to create Google Meet: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Google Meet created successfully:", data);
    
    if (!data.meetLink) {
      console.error("No meet link returned:", data);
      throw new Error("No Google Meet link was returned");
    }
    
    return data;
  } catch (error) {
    console.error('Error creating Google Meet event:', error);
    throw error;
  }
}