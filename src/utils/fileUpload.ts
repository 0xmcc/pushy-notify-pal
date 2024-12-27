import { supabase } from "@/integrations/supabase/client";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const sanitizeFilePath = (path: string): string => {
  return path.replace(/:/g, '-');
};

export const uploadFileToSupabase = async (
  file: File,
  filePath: string,
  attempt: number = 1
): Promise<{ publicUrl: string } | { error: Error }> => {
  try {
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error(`Upload attempt ${attempt} failed:`, uploadError);
      
      if (attempt < MAX_RETRIES && (uploadError.message.includes('network') || uploadError.message.includes('internet'))) {
        console.log(`Retrying upload in ${RETRY_DELAY/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return uploadFileToSupabase(file, filePath, attempt + 1);
      }
      
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { publicUrl };
  } catch (error) {
    return { error: error as Error };
  }
};