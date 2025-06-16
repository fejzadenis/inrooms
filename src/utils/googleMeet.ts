import axios from 'axios';

export async function createGoogleMeetEvent(eventDetails: {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
}) {
  try {
    const response = await axios.post('/api/create-meet', eventDetails);
    return response.data;
  } catch (error) {
    console.error('Error creating Google Meet event:', error);
    throw error;
  }
}