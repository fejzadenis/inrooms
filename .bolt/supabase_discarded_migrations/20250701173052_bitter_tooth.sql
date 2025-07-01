/*
  # Storage Policies for Avatar Uploads

  1. New Policies
    - Create policies for the avatars bucket to allow users to manage their own files
  
  2. Security
    - Enable RLS on the storage.objects table
    - Add policies for insert, select, update, and delete operations
*/

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to upload files to their own folder
CREATE POLICY "Users can upload avatars to their own folder" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to view any avatar
CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'avatars');

-- Create policy to allow users to update their own files
CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete their own avatars" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);